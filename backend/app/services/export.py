from __future__ import annotations

from datetime import datetime, timezone

from app.domain.schema import ExportEnvelope, Project


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
            }
            for a in project.architectures
        ],
        project=project.model_dump(),
    )
    return envelope.model_dump()


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

    return "\n".join(lines).strip() + "\n"


DEFAULT_RULES = [
    "Не нарушайте существующую архитектуру.",
    "Не меняйте интерфейсы без объяснения.",
    "Предпочитайте расширение существующих компонентов, а не параллельные аналоги.",
    "Сохраняйте ограничения протоколов, форматов данных и зависимостей.",
    "Если требование конфликтует с предложенным изменением, явно укажите это.",
]


def to_ai_prompt(project: Project, task: str = "", extra_rules: list[str] | None = None) -> str:
    semantic = to_semantic_export(project)
    md = to_markdown(project)
    rules = extra_rules or DEFAULT_RULES
    task_block = task.strip() or "[Опишите задачу реализации]"
    return "\n".join(
        [
            "Вы работаете со следующей архитектурой системы.",
            "",
            "Считайте её источником истины для ПО, железа, протоколов, потоков данных и алгоритмов.",
            "",
            "СИСТЕМА:",
            f"{project.name} ({project.current_version_label})",
            project.description,
            "",
            md,
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
    )


def _compact_json(data: dict) -> str:
    import json

    slim = {k: v for k, v in data.items() if k != "project"}
    return json.dumps(slim, indent=2, ensure_ascii=False)
