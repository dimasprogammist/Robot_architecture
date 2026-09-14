from app.services.learning import categories, get_article


def test_handbook_minimums():
    cats = {c["id"]: c for c in categories()}
    assert len(cats["python"]["articles"]) >= 50
    assert len(cats["cpp"]["articles"]) >= 50
    for key in [
        "linux",
        "git",
        "bash",
        "sql",
        "docker",
        "databases",
        "networking",
        "protocols",
        "microcontrollers",
        "electronics",
        "robotics",
        "software-architecture",
        "app",
    ]:
        assert len(cats[key]["articles"]) >= 10, key
    art = get_article("python-functions")
    assert art and "def " in art["content"]
    art = get_article("cpp-isr")
    assert art and "IRQ" in art["content"]
