from app.domain.schema import Project
from app.services.export import to_ai_prompt, to_markdown, to_semantic_export
from app.services.templates import create_from_template


def test_robot_export_contains_semantics():
    project = create_from_template("robot", "Robot", "Control system")
    payload = to_semantic_export(project)
    assert payload["format"] == "architecture-canvas"
    assert payload["system"]["name"] == "Robot"
    assert len(payload["components"]) >= 5
    assert payload["connections"]
    md = to_markdown(project)
    assert "System Architecture" in md
    assert "Controller" in md
    prompt = to_ai_prompt(project, "Implement firmware")
    assert "TASK:" in prompt
    assert "Implement firmware" in prompt
    restored = Project.model_validate(payload["project"])
    assert restored.name == "Robot"
