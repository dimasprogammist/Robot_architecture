from __future__ import annotations

import logging
import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

log = logging.getLogger("architecture.mail")


def _load_env_files() -> None:
    roots = [
        Path.cwd(),
        Path(__file__).resolve().parents[2],
        Path(__file__).resolve().parents[3],
        Path(__file__).resolve().parents[2] / "data",
    ]
    for root in roots:
        path = root / ".env"
        if not path.is_file():
            continue
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


def smtp_configured() -> bool:
    return bool((os.environ.get("SMTP_HOST") or "").strip())


def public_app_url() -> str:
    base = (os.environ.get("APP_BASE_URL") or os.environ.get("APP_PUBLIC_URL") or "").strip()
    return base.rstrip("/")


def send_mail(to: str, subject: str, body: str) -> str:
    host = (os.environ.get("SMTP_HOST") or "").strip()
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
