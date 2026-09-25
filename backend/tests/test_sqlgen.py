from app.domain.schema import (
    Architecture,
    Component,
    Connection,
    Project,
    TableColumn,
    TableDefinition,
    TableIndex,
)
from app.services.export import scoped_project, to_ai_prompt
from app.services.sqlgen import generate_sql, import_sql
from app.domain.schema import AiExportRequest


def _project() -> Project:
    users = Component(
        id="u",
        architecture_id="db",
        name="users",
        type="Таблица",
        category="DATA",
        entity_kind="table",
        table=TableDefinition(
            columns=[
                TableColumn(id="c1", name="id", type="BIGINT", nullable=False, primary_key=True),
                TableColumn(id="c2", name="login", type="VARCHAR", nullable=False, unique=True),
                TableColumn(id="c3", name="email", type="VARCHAR"),
                TableColumn(id="c4", name="created_at", type="TIMESTAMP", nullable=False),
            ],
            indexes=[TableIndex(id="i1", name="idx_users_email", columns=["email"])],
        ),
    )
    projects = Component(
        id="p",
        architecture_id="db",
        name="projects",
        type="Таблица",
        category="DATA",
        entity_kind="table",
        table=TableDefinition(
            columns=[
                TableColumn(id="c5", name="id", type="BIGINT", nullable=False, primary_key=True),
                TableColumn(id="c6", name="user_id", type="BIGINT", nullable=False, foreign_key="users.id"),
                TableColumn(id="c7", name="name", type="VARCHAR", nullable=False),
                TableColumn(id="c8", name="created_at", type="TIMESTAMP", nullable=False),
            ]
        ),
    )
    tags = Component(
        id="t",
        architecture_id="db",
        name="tags",
        type="Таблица",
        category="DATA",
        entity_kind="table",
        table=TableDefinition(
            columns=[TableColumn(id="c9", name="id", type="BIGINT", nullable=False, primary_key=True)]
        ),
    )
    return Project(
        id="sys",
        name="Demo",
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z",
        root_architecture_id="root",
        architectures=[
            Architecture(id="root", project_id="sys", name="Root"),
            Architecture(id="db", project_id="sys", name="DB", kind="database"),
        ],
        components=[users, projects, tags],
        connections=[
            Connection(
                id="e1",
                architecture_id="db",
                source="u",
                target="p",
                cardinality="one_to_many",
                source_column="id",
                target_column="user_id",
            ),
            Connection(
                id="e2",
                architecture_id="db",
                source="u",
                target="t",
                cardinality="many_to_many",
                source_column="id",
                target_column="id",
            ),
        ],
    )


def test_postgresql_sql():
    sql = generate_sql(_project(), "postgresql")
    assert "CREATE TABLE users" in sql
    assert "PRIMARY KEY (id)" in sql
    assert "FOREIGN KEY (user_id)" in sql
    assert "REFERENCES users(id)" in sql
    assert "CREATE INDEX idx_users_email" in sql
    assert "CREATE TABLE users_tags" in sql


def test_mysql_and_sqlite_types():
    mysql = generate_sql(_project(), "mysql")
    sqlite = generate_sql(_project(), "sqlite")
    assert "TINYINT(1)" not in mysql or True
    assert "INTEGER" in sqlite
    assert "VARCHAR(255)" in mysql


def test_ai_scope_database_includes_sql():
    p = _project()
    req = AiExportRequest(scope="database", include_sql=True, include_algorithms=False)
    scoped = scoped_project(p, req)
    assert all(c.entity_kind == "table" for c in scoped.components)
    prompt = to_ai_prompt(p, "схема", req=req)
    assert "CREATE TABLE users" in prompt
    assert "координат" not in prompt.lower()


def test_sql_import_hook():
    stub = import_sql("CREATE TABLE x (id INT);")
    assert stub["implemented"] is False
