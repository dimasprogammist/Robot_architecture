from __future__ import annotations

from datetime import datetime, timezone

from app.domain.schema import AiExportRequest, ExportEnvelope, Project
from app.services.sqlgen import generate_sql, tables_of


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def to_semantic_export(project: Project) -> dict:
    root = next((a for a in project.architectures if a.id == project.root_architecture_id), None)
    components = []
    for c in project.components:
        nested = next((a for a in project.architectures if a.id == c.nested_architecture_id), None)
        components.append(
            {
                "id": c.id,
                "name": c.name,
                "type": c.type,
                "category": c.category,
                "description": c.description,
                "technology": c.technology,
                "version": c.version,
                "status": c.status,
                "tags": c.tags,
                "owner": c.owner,
                "notes": c.notes,
                "modules": c.modules,
                "api": c.api,
                "state": c.state,
                "technologies": c.technologies,
                "documentation": c.documentation.model_dump(),
                "architecture_id": c.architecture_id,
                "nested_architecture": nested.name if nested else None,
                "nested_architecture_id": c.nested_architecture_id,
                "requirement_ids": c.requirement_ids,
                "hardware_id": c.hardware_id,
                "protocol_id": c.protocol_id,
                "entity_kind": c.entity_kind,
                "mechanical": c.mechanical.model_dump(),
                "table": c.table.model_dump() if c.table else None,
                "docs": [d.model_dump() for d in c.docs],
                "files": [f.model_dump() for f in c.files],
            }
        )

    connections = []
    data_flows = []
    for e in project.connections:
        payload = {
            "id": e.id,
            "source": _name(project, e.source),
            "source_id": e.source,
            "target": _name(project, e.target),
            "target_id": e.target,
            "protocol": e.protocol_name,
            "protocol_id": e.protocol_id,
            "direction": e.direction,
            "description": e.description,
            "data_format": e.data_format,
            "data_example": e.data_example,
            "frequency": e.frequency,
            "latency": e.latency,
            "reliability": e.reliability,
            "notes": e.notes,
            "architecture_id": e.architecture_id,
            "color": e.color,
            "cardinality": e.cardinality,
            "source_column": e.source_column,
            "target_column": e.target_column,
        }
        if e.kind == "data_flow":
            data_flows.append(payload)
        else:
            connections.append(payload)

    dependencies = []
    for c in project.components:
        if c.documentation.dependencies.strip():
            dependencies.append(
                {"component": c.name, "component_id": c.id, "dependencies": c.documentation.dependencies}
            )
        for other in project.connections:
            if other.source == c.id:
                dependencies.append(
                    {
                        "component": c.name,
                        "depends_on": _name(project, other.target),
                        "via": other.protocol_name or other.kind,
                    }
                )

    envelope = ExportEnvelope(
        exported_at=_now(),
        system={
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "version": project.current_version_label,
            "root_architecture": root.name if root else project.name,
        },
        components=components,
        connections=connections,
        data_flows=data_flows,
        protocols=[p.model_dump() for p in project.protocols],
        algorithms=[a.model_dump() for a in project.algorithms],
        dependencies=dependencies,
        requirements=[r.model_dump() for r in project.requirements],
        hardware=[h.model_dump() for h in project.hardware],
        documents=[d.model_dump() for d in project.documents],
        nested_architectures=[
            {
                "id": a.id,
                "name": a.name,
                "parent_component_id": a.parent_component_id,
                "description": a.description,
                "kind": a.kind,
            }
            for a in project.architectures
        ],
        mechanics=[
            {"id": c.id, "name": c.name, "type": c.type, **c.mechanical.model_dump()}
            for c in project.components
            if c.category == "MECHANICS"
        ],
        database={
            "tables": [
                {"name": c.name, **(c.table.model_dump() if c.table else {})}
                for c in tables_of(project)
            ],
            "relations": [
                {
                    "from": _name(project, e.source),
                    "to": _name(project, e.target),
                    "cardinality": e.cardinality,
                    "source_column": e.source_column,
                    "target_column": e.target_column,
                }
                for e in project.connections
                if e.cardinality or e.source_column
            ],
        },
        bom=[b.model_dump() for b in bom_items(project)],
        project=project.model_dump(),
    )
    return envelope.model_dump()


def bom_items(project: Project):
    from app.domain.schema import BomItem

    items = []
    for c in project.components:
        if c.category not in ("HARDWARE", "MECHANICS"):
            continue
        items.append(
            BomItem(
                component_id=c.id,
                name=c.name,
                category=c.category,
                manufacturer=c.mechanical.manufacturer,
                part_number=c.mechanical.part_number,
                quantity=c.mechanical.quantity or 1,
                unit=c.mechanical.unit or "шт",
                notes=c.mechanical.notes or c.notes,
            )
        )
    return items


def _name(project: Project, component_id: str) -> str:
    c = next((x for x in project.components if x.id == component_id), None)
    return c.name if c else component_id


def to_markdown(project: Project) -> str:
    lines: list[str] = [
        f"# Архитектура системы: {project.name}",
        "",
        f"Версия: {project.current_version_label}",
        "",
    ]
    if project.description:
        lines += [project.description, ""]

    lines += ["## Компоненты", ""]
    for c in project.components:
        lines += [f"### {c.name}", ""]
        lines.append(f"- Тип: {c.type}")
        if c.technology:
            lines.append(f"- Технология: {c.technology}")
        if c.version:
            lines.append(f"- Версия: {c.version}")
        if c.status:
            lines.append(f"- Статус: {c.status}")
        doc = c.documentation
        purpose = doc.purpose or c.description
        if purpose:
            lines += ["", "Назначение:", "", purpose]
        if doc.responsibilities:
            lines += ["", "Ответственность:", "", doc.responsibilities]
        if doc.inputs:
            lines += ["", "Входы:", "", doc.inputs]
        if doc.outputs:
            lines += ["", "Выходы:", "", doc.outputs]
        if doc.dependencies:
            lines += ["", "Зависимости:", "", doc.dependencies]
        if doc.interfaces:
            lines += ["", "Интерфейсы:", "", doc.interfaces]
        if c.api:
            lines += ["", "API:", "", c.api]
        if c.modules:
            lines += ["", "Модули:", ""] + [f"- {m}" for m in c.modules]
        if doc.failure_modes:
            lines += ["", "Отказы:", "", doc.failure_modes]
        if c.notes or doc.notes:
            lines += ["", "Заметки:", "", c.notes or doc.notes]
        lines.append("")

    lines += ["## Связи", ""]
    for e in project.connections:
        arrow = "↔" if e.direction == "bidirectional" else "→"
        src = _name(project, e.source)
        tgt = _name(project, e.target)
        proto = e.protocol_name or e.kind
        lines += [f"### {src} {arrow} {tgt}", "", f"Протокол: {proto}"]
        if e.data_format:
            lines.append(f"Данные: {e.data_format}")
        if e.data_example:
            lines += ["", "Пример полезной нагрузки:", "", "```", e.data_example, "```"]
        if e.frequency:
            lines.append(f"Частота: {e.frequency}")
        if e.latency:
            lines.append(f"Задержка: {e.latency}")
        if e.reliability:
            lines.append(f"Надёжность: {e.reliability}")
        if e.description:
            lines += ["", e.description]
        lines.append("")

    if project.algorithms:
        lines += ["## Алгоритмы", ""]
        for alg in project.algorithms:
            owner = _name(project, alg.component_id)
            lines += [f"### {alg.name} ({owner})", ""]
            if alg.description:
                lines += [alg.description, ""]
            if alg.inputs:
                lines += ["Входы:"] + [f"- {i}" for i in alg.inputs] + [""]
            if alg.outputs:
                lines += ["Выходы:"] + [f"- {o}" for o in alg.outputs] + [""]
            if alg.steps:
                lines.append("Шаги:")
                for i, step in enumerate(alg.steps, 1):
                    extra = ""
                    if step.kind == "condition":
                        extra = f" (если {step.condition}: {step.on_true} иначе {step.on_false})"
                    lines.append(f"{i}. {step.text}{extra}")
                lines.append("")
            if alg.states:
                lines += ["Состояния:"] + [f"- {s}" for s in alg.states] + [""]
            if alg.transitions:
                lines.append("Переходы:")
                for t in alg.transitions:
                    lines.append(f"- {t.source} → {t.target} ({t.trigger})")
                lines.append("")
            if alg.errors:
                lines += ["Ошибки:"] + [f"- {e}" for e in alg.errors] + [""]

    if project.protocols:
        lines += ["## Протоколы", ""]
        for proto in project.protocols:
            lines += [f"### {proto.name}", ""]
            for label, val in [
                ("Версия", proto.version),
                ("Транспорт", proto.transport),
                ("Порт", proto.port),
                ("Формат данных", proto.data_format),
                ("Кодировка", proto.encoding),
            ]:
                if val:
                    lines.append(f"- {label}: {val}")
            if proto.description:
                lines += ["", proto.description]
            if proto.message_structure:
                lines += ["", "Структура сообщения:", "", proto.message_structure]
            lines.append("")

    if project.requirements:
        lines += ["## Требования", ""]
        for r in project.requirements:
            linked = ", ".join(_name(project, cid) for cid in r.component_ids) or "—"
            lines += [f"### {r.code}", "", r.text, "", f"Связанные компоненты: {linked}", ""]

    if project.hardware:
        custom_hw = [h for h in project.hardware if not h.built_in] or project.hardware[:0]
        used_ids = {c.hardware_id for c in project.components if c.hardware_id}
        used = [h for h in project.hardware if h.id in used_ids or not h.built_in]
        if used:
            lines += ["## Железо", ""]
            for h in used:
                lines += [f"### {h.name}", ""]
                for label, val in [
                    ("Производитель", h.manufacturer),
                    ("Модель", h.model),
                    ("CPU", h.cpu),
                    ("RAM", h.ram),
                    ("Интерфейсы", h.interfaces),
                    ("Напряжение", h.voltage),
                    ("Протоколы", h.protocols),
                    ("ОС", h.os),
                ]:
                    if val:
                        lines.append(f"- {label}: {val}")
                lines.append("")

    tables = tables_of(project)
    if tables:
        lines += ["## База данных", ""]
        for t in tables:
            lines += [f"### {t.name}", ""]
            if t.table:
                for col in t.table.columns:
                    flags = []
                    if col.primary_key:
                        flags.append("PK")
                    if col.unique:
                        flags.append("UNIQUE")
                    if not col.nullable:
                        flags.append("NOT NULL")
                    extra = f" ({', '.join(flags)})" if flags else ""
                    lines.append(f"- {col.name} {col.type}{extra}")
                lines.append("")

    mech = [c for c in project.components if c.category == "MECHANICS"]
    if mech:
        lines += ["## Механика", ""]
        for c in mech:
            m = c.mechanical
            lines += [f"### {c.name}", "", f"- Тип: {c.type}"]
            if m.material:
                lines.append(f"- Материал: {m.material}")
            if m.dimensions:
                lines.append(f"- Размеры: {m.dimensions}")
            if m.quantity:
                lines.append(f"- Количество: {m.quantity} {m.unit}")
            lines.append("")

    return "\n".join(lines).strip() + "\n"


DEFAULT_RULES = [
    "Не нарушайте существующую архитектуру.",
    "Не меняйте интерфейсы без объяснения.",
    "Предпочитайте расширение существующих компонентов, а не параллельные аналоги.",
    "Сохраняйте ограничения протоколов, форматов данных и зависимостей.",
    "Если требование конфликтует с предложенным изменением, явно укажите это.",
]


def scoped_project(project: Project, req: AiExportRequest | None) -> Project:
    if not req or req.scope in ("", "all"):
        return project
    data = project.model_dump()
    scoped = Project.model_validate(data)
    ids: set[str] = set(req.component_ids)
    if req.scope == "selection" and ids:
        scoped.components = [c for c in scoped.components if c.id in ids]
    elif req.scope == "architecture" and req.architecture_id:
        scoped.components = [c for c in scoped.components if c.architecture_id == req.architecture_id]
        scoped.connections = [c for c in scoped.connections if c.architecture_id == req.architecture_id]
    elif req.scope == "database":
        table_ids = {c.id for c in tables_of(scoped)}
        scoped.components = [c for c in scoped.components if c.id in table_ids]
        scoped.connections = [c for c in scoped.connections if c.source in table_ids and c.target in table_ids]
        scoped.algorithms = []
    elif req.scope == "mechanics":
        mech_ids = {c.id for c in scoped.components if c.category == "MECHANICS"}
        scoped.components = [c for c in scoped.components if c.id in mech_ids]
        scoped.connections = [c for c in scoped.connections if c.source in mech_ids and c.target in mech_ids]
        scoped.algorithms = []
    elif req.scope == "algorithms":
        alg_ids = {a.component_id for a in scoped.algorithms}
        scoped.components = [c for c in scoped.components if c.id in alg_ids]
        scoped.connections = []
    keep = {c.id for c in scoped.components}
    scoped.connections = [c for c in scoped.connections if c.source in keep and c.target in keep]
    scoped.algorithms = [a for a in scoped.algorithms if a.component_id in keep]
    scoped.requirements = [r for r in scoped.requirements if not r.component_ids or any(i in keep for i in r.component_ids)]
    if req and not req.include_algorithms:
        scoped.algorithms = []
    if req and not req.include_requirements:
        scoped.requirements = []
    if req and not req.include_notes:
        for c in scoped.components:
            c.notes = ""
            c.documentation.notes = ""
    if req and not req.include_descriptions:
        for c in scoped.components:
            c.description = ""
            c.documentation = c.documentation.model_copy(update={"description": "", "purpose": ""})
    if req and not req.include_full_docs:
        for c in scoped.components:
            if not req.include_doc_meta:
                c.docs = []
            else:
                c.docs = [d.model_copy(update={"body": ""}) for d in c.docs]
    return scoped


def to_ai_prompt(project: Project, task: str = "", extra_rules: list[str] | None = None, req: AiExportRequest | None = None) -> str:
    if req:
        project = scoped_project(project, req)
        task = req.task or task
        extra_rules = req.rules or extra_rules
    semantic = to_semantic_export(project)
    md = to_markdown(project)
    rules = extra_rules or DEFAULT_RULES
    task_block = task.strip() or "[Опишите задачу реализации]"
    want_sql = bool(req and (req.include_sql or req.scope == "database"))
    sql = generate_sql(project) if want_sql and tables_of(project) else ""
    parts = [
        "Вы работаете со следующей инженерной моделью системы.",
        "",
        "Считайте её источником истины для ПО, железа, протоколов, данных, механики и алгоритмов.",
        "",
        "СИСТЕМА:",
        f"{project.name} ({project.current_version_label})",
        project.description,
        "",
        md,
    ]
    if sql:
        parts += ["", "SQL (PostgreSQL):", "```sql", sql, "```"]
    parts += [
        "",
        "СТРУКТУРНАЯ МОДЕЛЬ (JSON):",
        "```json",
        _compact_json(semantic),
        "```",
        "",
        "ЗАДАЧА:",
        task_block,
        "",
        "Правила:",
        *[f"- {r}" for r in rules],
        "",
    ]
    return "\n".join(parts)


def _compact_json(data: dict) -> str:
    import json

    slim = {k: v for k, v in data.items() if k != "project"}
    return json.dumps(slim, indent=2, ensure_ascii=False)
