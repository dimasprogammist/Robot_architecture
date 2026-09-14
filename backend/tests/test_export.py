from app.domain.schema import Project
from app.services.export import to_ai_prompt, to_markdown, to_semantic_export
from app.services.templates import create_from_template


def test_robot_export_contains_semantics():
    project = create_from_template("robot", "Робот", "Система управления")
    payload = to_semantic_export(project)
    assert payload["format"] == "architecture-canvas"
    assert payload["system"]["name"] == "Робот"
    assert len(payload["components"]) >= 5
    assert payload["connections"]
    md = to_markdown(project)
    assert "Архитектура системы" in md
    assert "Контроллер" in md
    prompt = to_ai_prompt(project, "Реализовать прошивку")
    assert "ЗАДАЧА:" in prompt
    assert "Реализовать прошивку" in prompt
    restored = Project.model_validate(payload["project"])
    assert restored.name == "Робот"
