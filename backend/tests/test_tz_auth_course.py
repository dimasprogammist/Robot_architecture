from fastapi import HTTPException

from app.domain.library import LIBRARY_PRESETS
from app.db import SessionLocal, UserRow
from app.services.auth import register_user, request_password_reset, reset_password
from app.services.course import _lessons


def test_course_notes_from_notes_folders():
    lessons = _lessons()
    by_order = {item["order"]: item for item in lessons if item.get("module_id") == "computer"}
    first = by_order.get(1) or next((item for item in lessons if item["order"] == 1), None)
    second = by_order.get(2) or next((item for item in lessons if item["order"] == 2), None)
    assert first and first.get("notes_url"), first
    assert second and second.get("notes_url"), second
    assert "/notes/" in first["notes_url"]
    assert "/notes/" in second["notes_url"]
    assert "L01" in first["notes_url"] or first["notes_url"].endswith(".svg")
    assert "L02" in second["notes_url"] or second["notes_url"].endswith(".svg")


def test_library_has_required_presets():
    names = {item["name"] for item in LIBRARY_PRESETS}
    for name in (
        "Java",
        "Go",
        "JavaScript",
        "TypeScript",
        "SQLite",
        "АД",
        "СД",
        "Шаговый двигатель",
        "Аккумулятор",
        "Делитель напряжения",
        "Rust",
        "Nginx",
        "Node-RED",
        "Mosquitto",
        "InfluxDB",
        "Grafana",
        "GNSS",
        "HMI",
        "Реле",
        "Предохранитель",
        "Трансформатор",
        "Лампа",
        "Диод",
        "Транзистор",
        "Резистор",
        "Кнопка",
        "Конденсатор",
        "Катушка индуктивности",
        "Переключатель",
        "Светодиод",
        "Операционный усилитель",
        "Электрический разъём",
        "Автоматический выключатель",
        "Kubernetes",
        "Prometheus",
        "FreeRTOS",
        "Zephyr",
        "gRPC",
        "Protobuf",
        "TimescaleDB",
        "ClickHouse",
        "NATS",
        "LoRa",
        "BLE",
        "LTE-модем",
        "EtherNet/IP",
        "OpenCV",
        "Gazebo",
    ):
        assert name in names, name
    types = {item["type"] for item in LIBRARY_PRESETS}
    assert "ДПТ" in types
    assert any(item["name"] == "Электрическое подключение" for item in LIBRARY_PRESETS)
    cats = {item["name"]: item["category"] for item in LIBRARY_PRESETS}
    assert cats["Аккумулятор"] == "ELECTRICAL"


def test_password_reset_without_smtp_is_503(monkeypatch):
    monkeypatch.delenv("SMTP_HOST", raising=False)
    monkeypatch.delenv("APP_BASE_URL", raising=False)
    monkeypatch.delenv("MAIL_BACKEND", raising=False)
    monkeypatch.delenv("MAIL_DIR", raising=False)
    db = SessionLocal()
    try:
        try:
            request_password_reset(db, "nobody@example.com", "203.0.113.9")
            raise AssertionError("expected HTTPException")
        except HTTPException as exc:
            assert exc.status_code == 503
            assert "reset_url" not in str(exc.detail).lower()
    finally:
        db.close()


def test_password_reset_unknown_email_has_no_url(monkeypatch):
    monkeypatch.setenv("SMTP_HOST", "smtp.example.com")
    monkeypatch.setenv("SMTP_FROM", "noreply@example.com")
    monkeypatch.setenv("APP_BASE_URL", "https://app.example.com")
    db = SessionLocal()
    try:
        result = request_password_reset(db, "missing-user-tz@example.com", "203.0.113.10")
        assert result["ok"] is True
        assert "reset_url" not in result
        assert result["message"]
    finally:
        db.close()


def test_password_reset_link_uses_public_base_url(monkeypatch):
    monkeypatch.setenv("SMTP_HOST", "smtp.example.com")
    monkeypatch.setenv("SMTP_FROM", "noreply@example.com")
    monkeypatch.setenv("APP_BASE_URL", "https://app.example.com")
    captured: dict[str, str] = {}

    def fake_send(to: str, subject: str, body: str) -> str:
        captured["to"] = to
        captured["body"] = body
        return "ok"

    monkeypatch.setattr("app.services.auth.send_mail", fake_send)
    db = SessionLocal()
    try:
        email = "tz-reset-url@example.com"
        if db.query(UserRow).filter(UserRow.email == email).first() is None:
            register_user(db, email, "secret12", "Reset")
        result = request_password_reset(db, email, "203.0.113.11")
        assert result["ok"] is True
        assert "reset_url" not in result
        assert "https://app.example.com/reset?token=" in captured["body"]
        assert "localhost" not in captured["body"]
        assert "SMTP_PASSWORD" not in captured["body"]
        assert captured["to"] == email
    finally:
        db.close()


def test_password_reset_file_backend_one_time_token(monkeypatch, tmp_path):
    import re

    from app.db import PasswordResetRow
    from app.services.auth import verify_password

    monkeypatch.setenv("MAIL_BACKEND", "file")
    monkeypatch.setenv("MAIL_DIR", str(tmp_path))
    monkeypatch.setenv("APP_BASE_URL", "http://localhost:5173")
    monkeypatch.setenv("SMTP_FROM", "noreply@localhost")
    monkeypatch.delenv("SMTP_HOST", raising=False)
    db = SessionLocal()
    try:
        email = "tz-file-mail@example.com"
        user = db.query(UserRow).filter(UserRow.email == email).first()
        if user is None:
            user = register_user(db, email, "oldpass1", "FileMail")
        result = request_password_reset(db, email, "203.0.113.12")
        assert result["ok"] is True
        assert "reset_url" not in result
        files = list(tmp_path.glob("*.eml"))
        assert len(files) == 1
        raw = files[0].read_text(encoding="utf-8")
        from email import message_from_string

        parsed = message_from_string(raw)
        payload = parsed.get_payload(decode=True)
        body = payload.decode("utf-8") if isinstance(payload, bytes) else str(parsed.get_payload())
        match = re.search(r"/reset\?token=([A-Za-z0-9_\-]+)", body)
        assert match, body
        token = match.group(1)
        reset_password(db, token, "newpass9", "newpass9")
        db.refresh(user)
        assert verify_password("newpass9", user.password_hash)
        try:
            reset_password(db, token, "another1", "another1")
            raise AssertionError("expected HTTPException")
        except HTTPException as exc:
            assert exc.status_code == 400
        row = db.query(PasswordResetRow).filter(PasswordResetRow.user_id == user.id).order_by(PasswordResetRow.expires_at.desc()).first()
        assert row is not None and row.used_at is not None
    finally:
        db.close()


def test_mail_backend_prefers_smtp_host_over_file(monkeypatch):
    from app.services import mail as mail_mod

    monkeypatch.setenv("MAIL_BACKEND", "file")
    monkeypatch.setenv("SMTP_HOST", "smtp.example.com")
    assert mail_mod.mail_backend() == "smtp"
    monkeypatch.delenv("SMTP_HOST", raising=False)
    assert mail_mod.mail_backend() == "file"


def test_password_reset_delivery_error_is_503(monkeypatch):
    from app.services.mail import MailDeliveryError

    monkeypatch.setenv("SMTP_HOST", "smtp.example.com")
    monkeypatch.setenv("SMTP_FROM", "noreply@example.com")
    monkeypatch.setenv("APP_BASE_URL", "https://app.example.com")

    def boom(_to: str, _subject: str, _body: str) -> str:
        raise MailDeliveryError("Не удалось отправить письмо. Проверьте настройки SMTP.")

    monkeypatch.setattr("app.services.auth.send_mail", boom)
    db = SessionLocal()
    try:
        email = "tz-smtp-fail@example.com"
        if db.query(UserRow).filter(UserRow.email == email).first() is None:
            register_user(db, email, "secret12", "FailMail")
        try:
            request_password_reset(db, email, "203.0.113.13")
            raise AssertionError("expected HTTPException")
        except HTTPException as exc:
            assert exc.status_code == 503
            assert "reset_url" not in str(exc.detail).lower()
    finally:
        db.close()


def test_reset_password_rejects_bogus_token():
    db = SessionLocal()
    try:
        try:
            reset_password(db, "not-a-real-token", "secret1", "secret1")
            raise AssertionError("expected HTTPException")
        except HTTPException as exc:
            assert exc.status_code == 400
            assert "недействитель" in str(exc.detail).lower()
    finally:
        db.close()
