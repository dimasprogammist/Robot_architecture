from __future__ import annotations

from app.domain.schema import Component, Project


DIALECT_TYPES = {
    "postgresql": {
        "INT": "INTEGER",
        "BIGINT": "BIGINT",
        "TEXT": "TEXT",
        "VARCHAR": "VARCHAR(255)",
        "TIMESTAMP": "TIMESTAMP",
        "BOOLEAN": "BOOLEAN",
        "FLOAT": "DOUBLE PRECISION",
        "UUID": "UUID",
        "JSON": "JSONB",
    },
    "mysql": {
        "INT": "INT",
        "BIGINT": "BIGINT",
        "TEXT": "TEXT",
        "VARCHAR": "VARCHAR(255)",
        "TIMESTAMP": "TIMESTAMP",
        "BOOLEAN": "TINYINT(1)",
        "FLOAT": "DOUBLE",
        "UUID": "CHAR(36)",
        "JSON": "JSON",
    },
    "sqlite": {
        "INT": "INTEGER",
        "BIGINT": "INTEGER",
        "TEXT": "TEXT",
        "VARCHAR": "TEXT",
        "TIMESTAMP": "TEXT",
        "BOOLEAN": "INTEGER",
        "FLOAT": "REAL",
        "UUID": "TEXT",
        "JSON": "TEXT",
    },
}


def _map_type(raw: str, dialect: str) -> str:
    key = (raw or "TEXT").strip().upper()
    mapping = DIALECT_TYPES.get(dialect, DIALECT_TYPES["postgresql"])
    if key in mapping:
        return mapping[key]
    if key.startswith("VARCHAR"):
        return raw if dialect != "sqlite" else "TEXT"
    return raw or mapping["TEXT"]


def tables_of(project: Project) -> list[Component]:
    return [c for c in project.components if c.entity_kind == "table" or (c.table and c.table.columns)]


def generate_sql(project: Project, dialect: str = "postgresql") -> str:
    dialect = dialect if dialect in DIALECT_TYPES else "postgresql"
    tables = tables_of(project)
    lines: list[str] = [f"-- {project.name} / {dialect}", ""]
    for t in tables:
        td = t.table
        if not td:
            continue
        col_sql = []
        pks = []
        for col in td.columns:
            parts = [col.name, _map_type(col.type, dialect)]
            if not col.nullable:
                parts.append("NOT NULL")
            if col.unique and not col.primary_key:
                parts.append("UNIQUE")
            if col.default:
                parts.append(f"DEFAULT {col.default}")
            col_sql.append("    " + " ".join(parts))
            if col.primary_key:
                pks.append(col.name)
        if pks:
            col_sql.append(f"    PRIMARY KEY ({', '.join(pks)})")
        for conn in project.connections:
            if conn.cardinality == "many_to_many":
                continue
            if conn.target != t.id or not conn.target_column or not conn.source_column:
                continue
            parent = next((x for x in tables if x.id == conn.source), None)
            if not parent:
                continue
            col_sql.append(
                f"    CONSTRAINT fk_{t.name}_{conn.target_column} FOREIGN KEY ({conn.target_column}) "
                f"REFERENCES {parent.name}({conn.source_column})"
            )
        body = ",\n".join(col_sql) if col_sql else "    id INTEGER PRIMARY KEY"
        lines.append(f"CREATE TABLE {t.name} (")
        lines.append(body)
        lines.append(");")
        lines.append("")
        for idx in td.indexes:
            uniq = "UNIQUE " if idx.unique else ""
            cols = ", ".join(idx.columns) or "id"
            lines.append(f"CREATE {uniq}INDEX {idx.name} ON {t.name} ({cols});")
            lines.append("")
    table_names = {t.name.lower() for t in tables}
    for conn in project.connections:
        if conn.cardinality != "many_to_many":
            continue
        left = next((x for x in tables if x.id == conn.source), None)
        right = next((x for x in tables if x.id == conn.target), None)
        if not left or not right:
            continue
        jname = f"{left.name}_{right.name}"
        if jname.lower() in table_names:
            continue
        left_col = conn.source_column or "id"
        right_col = conn.target_column or "id"
        lines.append(f"CREATE TABLE {jname} (")
        lines.append(f"    {left.name}_id {_map_type('BIGINT', dialect)} NOT NULL,")
        lines.append(f"    {right.name}_id {_map_type('BIGINT', dialect)} NOT NULL,")
        lines.append(f"    PRIMARY KEY ({left.name}_id, {right.name}_id),")
        lines.append(
            f"    FOREIGN KEY ({left.name}_id) REFERENCES {left.name}({left_col}),"
        )
        lines.append(
            f"    FOREIGN KEY ({right.name}_id) REFERENCES {right.name}({right_col})"
        )
        lines.append(");")
        lines.append("")
        table_names.add(jname.lower())
    return "\n".join(lines).strip() + "\n"


def import_sql(sql: str, dialect: str = "postgresql") -> dict:
    """Hook for future SQL → Database Model → ER canvas.

    The canonical target is Component(entity_kind=table) + Connection(cardinality).
    A parser can be added here without changing the project graph storage.
    """
    return {
        "dialect": dialect,
        "sql": sql,
        "tables": [],
        "relations": [],
        "implemented": False,
    }
