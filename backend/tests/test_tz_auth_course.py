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
