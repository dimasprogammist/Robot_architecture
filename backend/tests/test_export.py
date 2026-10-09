from app.domain.schema import MechanicsModel, Project
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


def test_mechanics_model_roundtrip():
    project = create_from_template("robot", "Робот", "")
    project.mechanics = MechanicsModel.model_validate({
        "id": "mech-1",
        "name": "Манипулятор",
        "elements": [
            {
                "id": "el-1",
                "kind": "link",
                "name": "Звено",
                "x": 0.1,
                "y": 0.0,
                "theta": 0,
                "mass": 0.2,
                "catalog_component_id": "comp-1",
                "params": {"length": 0.2},
                "anchors": [{"id": "a", "name": "A", "x": 0, "y": 0}],
            }
        ],
        "joints": [
            {
                "id": "j-1",
                "kind": "revolute",
                "parent_id": "el-1",
                "child_id": "el-1",
                "parent_anchor": "a",
                "child_anchor": "a",
                "q": 0.5,
            }
        ],
        "ee_id": "el-1",
        "elbow": "up",
        "trail": [{"x": 0.1, "y": 0.0}],
        "trail_on": True,
        "load_mass": 1.0,
        "load_lever": 0.2,
        "show_axes": True,
        "show_dims": True,
    })
    dumped = Project.model_validate(project.model_dump())
    assert dumped.mechanics is not None
    assert dumped.mechanics.name == "Манипулятор"
    assert dumped.mechanics.elements[0].catalog_component_id == "comp-1"
    assert dumped.mechanics.joints[0].q == 0.5
    restored = Project.model_validate(to_semantic_export(dumped)["project"])
    assert restored.mechanics is not None
    assert len(restored.mechanics.elements) == 1
    assert restored.mechanics.joints[0].kind == "revolute"
