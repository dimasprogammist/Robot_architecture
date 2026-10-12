from __future__ import annotations

import logging
import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

log = logging.getLogger("architecture.mail")


def _load_env_files() -> None:
    here = Path(__file__).resolve()
    roots = [
        Path.cwd(),
        here.parents[2],
        here.parents[3] if len(here.parents) > 3 else here.parents[2],
        here.parents[2] / "data",
        Path.cwd() / "data",
    ]
    seen: set[Path] = set()
    for root in roots:
        for name in (".env", ".env.local"):
            path = (root / name).resolve()
            if path in seen or not path.is_file():
                continue
            seen.add(path)
            try:
                for raw in path.read_text(encoding="utf-8").splitlines():
                    line = raw.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, _, value = line.partition("=")
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if key and key not in os.environ:
                        os.environ[key] = value
            except OSError:
                continue


_load_env_files()


class MailConfigError(RuntimeError):
    pass


class MailDeliveryError(RuntimeError):
    pass


def mail_backend() -> str:
    raw = (os.environ.get("MAIL_BACKEND") or "").strip().lower()
    host = smtp_host()
    if raw == "smtp":
        return "smtp" if host else ""
    if host:
        return "smtp"
    if raw == "file":
        return "file"
    return ""


def smtp_host() -> str:
    return (os.environ.get("SMTP_HOST") or "").strip()


def smtp_configured() -> bool:
    backend = mail_backend()
    if backend == "file":
        return True
    return backend == "smtp" and bool(smtp_host())


def public_app_url() -> str:
    base = (os.environ.get("APP_BASE_URL") or os.environ.get("APP_PUBLIC_URL") or "").strip()
    if not base:
        base = "http://localhost:5173"
    return base.rstrip("/")


def _mail_dir() -> Path:
    configured = (os.environ.get("MAIL_DIR") or "").strip()
    if configured:
        path = Path(configured)
    else:
        path = Path(__file__).resolve().parents[2] / "data" / "mail"
    path.mkdir(parents=True, exist_ok=True)
    return path


def send_mail(to: str, subject: str, body: str) -> str:
    backend = mail_backend()
    if backend == "file":
        return _send_file(to, subject, body)
    if backend != "smtp":
        raise MailConfigError(
            "Почтовый сервер не настроен: задайте SMTP_HOST и SMTP_FROM или MAIL_BACKEND=file."
        )
    return _send_smtp(to, subject, body)


def _send_file(to: str, subject: str, body: str) -> str:
    sender = (os.environ.get("SMTP_FROM") or "noreply@localhost").strip()
    message = EmailMessage()
    message["From"] = sender
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    folder = _mail_dir()
    safe = "".join(ch if ch.isalnum() or ch in "._-+@" else "_" for ch in to)[:80]
    path = folder / f"{os.getpid()}-{safe}.eml"
    path.write_text(message.as_string(), encoding="utf-8")
    log.info("Password reset mail written to file backend")
    return "file"


def _send_smtp(to: str, subject: str, body: str) -> str:
    host = smtp_host()
    if not host:
        raise MailConfigError(
            "Почтовый сервер не настроен: задайте SMTP_HOST, SMTP_PORT, SMTP_FROM и APP_BASE_URL."
        )

    port = int(os.environ.get("SMTP_PORT") or "587")
    user = os.environ.get("SMTP_USER") or ""
    password = os.environ.get("SMTP_PASSWORD") or ""
    sender = os.environ.get("SMTP_FROM") or user
    if not sender:
        raise MailConfigError("Задайте SMTP_FROM или SMTP_USER для отправителя писем.")

    use_ssl = (os.environ.get("SMTP_SSL") or "").lower() in {"1", "true", "yes"} or port == 465
    use_tls = (os.environ.get("SMTP_STARTTLS") or "true").lower() in {"1", "true", "yes"}

    message = EmailMessage()
    message["From"] = sender
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    try:
        if use_ssl:
            smtp: smtplib.SMTP = smtplib.SMTP_SSL(host, port, timeout=20)
        else:
            smtp = smtplib.SMTP(host, port, timeout=20)
        with smtp:
            if not use_ssl and use_tls:
                smtp.starttls()
            if user:
                smtp.login(user, password)
            smtp.send_message(message)
    except MailConfigError:
        raise
    except Exception as exc:
        log.error("SMTP delivery failed: %s", type(exc).__name__)
        raise MailDeliveryError("Не удалось отправить письмо. Проверьте настройки SMTP.") from exc
    return "smtp"
