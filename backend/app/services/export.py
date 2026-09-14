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
        f"# System Architecture: {project.name}",
        "",
        f"Version: {project.current_version_label}",
        "",
    ]
    if project.description:
        lines += [project.description, ""]

    lines += ["## Components", ""]
    for c in project.components:
        lines += [f"### {c.name}", ""]
        lines.append(f"- Type: {c.type}")
        if c.technology:
            lines.append(f"- Technology: {c.technology}")
        if c.version:
            lines.append(f"- Version: {c.version}")
        if c.status:
            lines.append(f"- Status: {c.status}")
        doc = c.documentation
        purpose = doc.purpose or c.description
        if purpose:
            lines += ["", "Purpose:", "", purpose]
        if doc.responsibilities:
            lines += ["", "Responsibilities:", "", doc.responsibilities]
        if doc.inputs:
            lines += ["", "Inputs:", "", doc.inputs]
        if doc.outputs:
            lines += ["", "Outputs:", "", doc.outputs]
        if doc.dependencies:
            lines += ["", "Dependencies:", "", doc.dependencies]
        if doc.interfaces:
            lines += ["", "Interfaces:", "", doc.interfaces]
        if c.api:
            lines += ["", "API:", "", c.api]
        if c.modules:
            lines += ["", "Modules:", ""] + [f"- {m}" for m in c.modules]
        if doc.failure_modes:
            lines += ["", "Failure modes:", "", doc.failure_modes]
        if c.notes or doc.notes:
            lines += ["", "Notes:", "", c.notes or doc.notes]
        lines.append("")

    lines += ["## Connections", ""]
    for e in project.connections:
        arrow = "↔" if e.direction == "bidirectional" else "→"
        src = _name(project, e.source)
        tgt = _name(project, e.target)
        proto = e.protocol_name or e.kind
        lines += [f"### {src} {arrow} {tgt}", "", f"Protocol: {proto}"]
        if e.data_format:
            lines.append(f"Data: {e.data_format}")
        if e.data_example:
            lines += ["", "Payload example:", "", "```", e.data_example, "```"]
        if e.frequency:
            lines.append(f"Frequency: {e.frequency}")
        if e.latency:
            lines.append(f"Latency: {e.latency}")
        if e.reliability:
            lines.append(f"Reliability: {e.reliability}")
        if e.description:
            lines += ["", e.description]
        lines.append("")

    if project.algorithms:
        lines += ["## Algorithms", ""]
        for alg in project.algorithms:
            owner = _name(project, alg.component_id)
            lines += [f"### {alg.name} ({owner})", ""]
            if alg.description:
                lines += [alg.description, ""]
            if alg.inputs:
                lines += ["Inputs:"] + [f"- {i}" for i in alg.inputs] + [""]
            if alg.outputs:
                lines += ["Outputs:"] + [f"- {o}" for o in alg.outputs] + [""]
            if alg.steps:
                lines.append("Steps:")
                for i, step in enumerate(alg.steps, 1):
                    extra = ""
                    if step.kind == "condition":
                        extra = f" (if {step.condition}: {step.on_true} else {step.on_false})"
                    lines.append(f"{i}. {step.text}{extra}")
                lines.append("")
            if alg.states:
                lines += ["States:"] + [f"- {s}" for s in alg.states] + [""]
            if alg.transitions:
                lines.append("Transitions:")
                for t in alg.transitions:
                    lines.append(f"- {t.source} → {t.target} ({t.trigger})")
                lines.append("")
            if alg.errors:
                lines += ["Errors:"] + [f"- {e}" for e in alg.errors] + [""]

    if project.protocols:
        lines += ["## Protocols", ""]
        for proto in project.protocols:
            lines += [f"### {proto.name}", ""]
            for label, val in [
                ("Version", proto.version),
                ("Transport", proto.transport),
                ("Port", proto.port),
                ("Data format", proto.data_format),
                ("Encoding", proto.encoding),
            ]:
                if val:
                    lines.append(f"- {label}: {val}")
            if proto.description:
                lines += ["", proto.description]
            if proto.message_structure:
                lines += ["", "Message structure:", "", proto.message_structure]
            lines.append("")

    if project.requirements:
        lines += ["## Requirements", ""]
        for r in project.requirements:
            linked = ", ".join(_name(project, cid) for cid in r.component_ids) or "—"
            lines += [f"### {r.code}", "", r.text, "", f"Linked components: {linked}", ""]

    if project.hardware:
        custom_hw = [h for h in project.hardware if not h.built_in] or project.hardware[:0]
        used_ids = {c.hardware_id for c in project.components if c.hardware_id}
        used = [h for h in project.hardware if h.id in used_ids or not h.built_in]
        if used:
            lines += ["## Hardware", ""]
            for h in used:
                lines += [f"### {h.name}", ""]
                for label, val in [
                    ("Manufacturer", h.manufacturer),
                    ("Model", h.model),
                    ("CPU", h.cpu),
                    ("RAM", h.ram),
                    ("Interfaces", h.interfaces),
                    ("Voltage", h.voltage),
                    ("Protocols", h.protocols),
                    ("OS", h.os),
                ]:
                    if val:
                        lines.append(f"- {label}: {val}")
                lines.append("")

    return "\n".join(lines).strip() + "\n"


DEFAULT_RULES = [
    "Do not violate existing architecture.",
    "Do not change interfaces without explanation.",
    "Prefer extending existing components over inventing parallel ones.",
    "Preserve protocol, data format, and dependency constraints.",
    "If a requirement conflicts with a proposed change, call it out explicitly.",
]


def to_ai_prompt(project: Project, task: str = "", extra_rules: list[str] | None = None) -> str:
    semantic = to_semantic_export(project)
    md = to_markdown(project)
    rules = extra_rules or DEFAULT_RULES
    task_block = task.strip() or "[Describe the implementation task here]"
    return "\n".join(
        [
            "You are working with the following system architecture.",
            "",
            "Use it as the source of truth for software, hardware, protocols, data flow, and algorithms.",
            "",
            "SYSTEM:",
            f"{project.name} ({project.current_version_label})",
            project.description,
            "",
            md,
            "",
            "STRUCTURED MODEL (JSON):",
            "```json",
            _compact_json(semantic),
            "```",
            "",
            "TASK:",
            task_block,
            "",
            "Rules:",
            *[f"- {r}" for r in rules],
            "",
        ]
    )


def _compact_json(data: dict) -> str:
    import json

    slim = {k: v for k, v in data.items() if k != "project"}
    return json.dumps(slim, indent=2, ensure_ascii=False)
