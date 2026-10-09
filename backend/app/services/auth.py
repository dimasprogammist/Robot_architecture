from __future__ import annotations

import hashlib
import logging
import secrets
import time
from collections import defaultdict, deque
from datetime import timezone, timedelta

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db import PasswordResetRow, SessionRow, UserRow, UserSessionRow, get_db, new_id, utcnow
from app.services.mail import MailConfigError, MailDeliveryError, public_app_url, send_mail, smtp_configured

log = logging.getLogger("architecture.auth")

ROLE_USER = "user"
ROLE_ADMIN = "admin"

_RESET_WINDOW = 3600
_RESET_PER_EMAIL = 5
_RESET_PER_IP = 12
_reset_hits: dict[str, deque[float]] = defaultdict(deque)


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    salt, _, digest = stored.partition("$")
    if not salt or not digest:
        return False
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return secrets.compare_digest(check, digest)


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def register_user(db: Session, email: str, password: str, display_name: str) -> UserRow:
    email = email.strip().lower()
    if "@" not in email or len(password) < 6:
        raise HTTPException(400, "Нужны почта и пароль не короче 6 символов")
    if db.query(UserRow).filter(UserRow.email == email).first():
        raise HTTPException(409, "Такой аккаунт уже есть")
    user = UserRow(
        id=new_id(),
        email=email,
        password_hash=hash_password(password),
        display_name=display_name.strip() or email.split("@")[0],
        role=ROLE_USER,
        created_at=utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, email: str, password: str) -> tuple[UserRow, str]:
    user = db.query(UserRow).filter(UserRow.email == email.strip().lower()).first()
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(401, "Неверная почта или пароль")
    token = secrets.token_urlsafe(32)
    now = utcnow()
    log_row = UserSessionRow(id=new_id(), user_id=user.id, login_at=now, logout_at=None)
    db.add(log_row)
    db.add(SessionRow(token_hash=_token_hash(token), user_id=user.id, created_at=now, session_log_id=log_row.id))
    db.commit()
    return user, token


def logout_user(db: Session, token: str) -> None:
    row = db.get(SessionRow, _token_hash(token))
    if not row:
        return
    if row.session_log_id:
        log_row = db.get(UserSessionRow, row.session_log_id)
        if log_row and log_row.logout_at is None:
            log_row.logout_at = utcnow()
    db.delete(row)
    db.commit()


def list_user_sessions(db: Session, user_id: str | None = None) -> list[UserSessionRow]:
    query = db.query(UserSessionRow)
    if user_id:
        query = query.filter(UserSessionRow.user_id == user_id)
    return query.order_by(UserSessionRow.login_at.desc()).all()


def user_from_token(db: Session, token: str) -> UserRow | None:
    row = db.get(SessionRow, _token_hash(token))
    if row is None:
        return None
    return db.get(UserRow, row.user_id)


def optional_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> UserRow | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    return user_from_token(db, authorization.split(" ", 1)[1].strip())


def require_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> UserRow:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Нужно войти в аккаунт")
    user = user_from_token(db, authorization.split(" ", 1)[1].strip())
    if user is None:
        raise HTTPException(401, "Сессия недействительна")
    return user


def require_admin(user: UserRow = Depends(require_user)) -> UserRow:
    if user.role != ROLE_ADMIN:
        raise HTTPException(403, "Недостаточно прав")
    return user


def _rate_limited(key: str, limit: int) -> bool:
    now = time.time()
    bucket = _reset_hits[key]
    while bucket and now - bucket[0] > _RESET_WINDOW:
        bucket.popleft()
    if len(bucket) >= limit:
        return True
    bucket.append(now)
    return False


def request_password_reset(db: Session, email: str, client_ip: str | None = None) -> dict:
    email = email.strip().lower()
    accepted = {"ok": True, "message": "Если аккаунт с этой почтой существует, мы отправили ссылку для сброса пароля."}
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(400, "Укажите корректный адрес почты")
    ip = (client_ip or "unknown").split(",")[0].strip() or "unknown"
    if _rate_limited(f"email:{email}", _RESET_PER_EMAIL) or _rate_limited(f"ip:{ip}", _RESET_PER_IP):
        raise HTTPException(429, "Слишком много запросов. Подождите и попробуйте снова.")
    if not smtp_configured():
        log.error("Password reset refused: SMTP_HOST is not configured")
        raise HTTPException(503, "Почтовый сервис не настроен. Обратитесь к администратору.")
    if not public_app_url():
        log.error("Password reset refused: APP_BASE_URL is not configured")
        raise HTTPException(503, "Почтовый сервис не настроен. Обратитесь к администратору.")
    user = db.query(UserRow).filter(UserRow.email == email).first()
    if user is None:
        return accepted
    now = utcnow()
    pending = db.query(PasswordResetRow).filter(
        PasswordResetRow.user_id == user.id,
        PasswordResetRow.used_at.is_(None),
    )
    for row in pending:
        row.used_at = now
    token = secrets.token_urlsafe(32)
    db.add(
        PasswordResetRow(
            token_hash=_token_hash(token),
            user_id=user.id,
            expires_at=now + timedelta(hours=2),
            used_at=None,
        )
    )
    db.commit()
    reset_url = f"{public_app_url()}/reset?token={token}"
    body = (
        "Сброс пароля Architecture Canvas.\n\n"
        "Перейдите по ссылке, чтобы задать новый пароль. Ссылка действует 2 часа и одноразовая.\n"
        f"{reset_url}\n\n"
        "Если вы не запрашивали сброс, просто проигнорируйте это письмо.\n"
    )
    try:
        send_mail(user.email, "Сброс пароля Architecture Canvas", body)
    except (MailConfigError, MailDeliveryError) as exc:
        log.error("Password reset mail failed: %s", type(exc).__name__)
        raise HTTPException(503, "Не удалось отправить письмо. Попробуйте позже или обратитесь к администратору.") from exc
    return accepted


def reset_password(db: Session, token: str, password: str, password_repeat: str) -> None:
    if len(password) < 6:
        raise HTTPException(400, "Пароль должен быть не короче 6 символов")
    if password != password_repeat:
        raise HTTPException(400, "Пароли не совпадают")
    if not token.strip():
        raise HTTPException(400, "Ссылка недействительна")
    row = db.get(PasswordResetRow, _token_hash(token.strip()))
    if row is None:
        raise HTTPException(400, "Ссылка недействительна")
    expires = row.expires_at
    if expires is not None and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if row.used_at is not None:
        raise HTTPException(400, "Ссылка уже использована")
    if expires is None or expires < utcnow():
        raise HTTPException(400, "Срок действия ссылки истёк")
    user = db.get(UserRow, row.user_id)
    if user is None:
        raise HTTPException(400, "Ссылка недействительна")
    user.password_hash = hash_password(password)
    row.used_at = utcnow()
    db.commit()


def public_user(user: UserRow) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "role": user.role,
    }
