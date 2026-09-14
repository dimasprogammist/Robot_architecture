"""Canonical domain model — also the JSON export/import contract."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


Direction = Literal["unidirectional", "bidirectional"]
ConnectionKind = Literal["connection", "data_flow"]
AlgorithmStepKind = Literal["action", "condition", "loop", "input", "output", "error"]
ViewMode = Literal["architecture", "algorithm", "state_machine"]


class Position(BaseModel):
    x: float = 0
    y: float = 0


class Documentation(BaseModel):
    description: str = ""
    purpose: str = ""
    responsibilities: str = ""
    inputs: str = ""
    outputs: str = ""
    dependencies: str = ""
    interfaces: str = ""
    failure_modes: str = ""
    notes: str = ""


class ComponentTypeDef(BaseModel):
    id: str
    category: str
    name: str
    icon: str = "box"
    built_in: bool = True


class Protocol(BaseModel):
    id: str
    name: str
    version: str = "1.0"
    transport: str = ""
    port: str = ""
    direction: Direction = "bidirectional"
    data_format: str = ""
    encoding: str = ""
    description: str = ""
    message_structure: str = ""
    timing: str = ""
    timeout: str = ""
    retry: str = ""
    crc: str = ""
    notes: str = ""
    built_in: bool = False
    color: str = ""


class HardwareComponent(BaseModel):
    id: str
    name: str
    manufacturer: str = ""
    model: str = ""
    cpu: str = ""
    ram: str = ""
    interfaces: str = ""
    voltage: str = ""
    protocols: str = ""
    os: str = ""
    datasheet: str = ""
    notes: str = ""
    category: str = "Custom Hardware"
    built_in: bool = False


class AlgorithmStep(BaseModel):
    id: str
    kind: AlgorithmStepKind = "action"
    text: str = ""
    condition: str = ""
    on_true: str = ""
    on_false: str = ""


class StateTransition(BaseModel):
    id: str
    source: str
    target: str
    trigger: str = ""
    guard: str = ""


class AlgorithmNode(BaseModel):
    id: str
    kind: str = "action"
    label: str = ""
    position: Position = Field(default_factory=Position)


class AlgorithmEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str = ""


class Algorithm(BaseModel):
    id: str
    component_id: str
    name: str = "Algorithm"
    description: str = ""
    steps: list[AlgorithmStep] = Field(default_factory=list)
    inputs: list[str] = Field(default_factory=list)
    outputs: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    conditions: list[str] = Field(default_factory=list)
    loops: list[str] = Field(default_factory=list)
    states: list[str] = Field(default_factory=list)
    transitions: list[StateTransition] = Field(default_factory=list)
    canvas_nodes: list[AlgorithmNode] = Field(default_factory=list)
    canvas_edges: list[AlgorithmEdge] = Field(default_factory=list)


class PrintSettings(BaseModel):
    nozzle_size: str = ""
    layer_height: str = ""
    material: str = ""
    infill: str = ""
    supports: str = ""
    print_orientation: str = ""
    printer: str = ""
    notes: str = ""


class MechanicalData(BaseModel):
    material: str = ""
    dimensions: str = ""
    weight: str = ""
    quantity: float = 1
    unit: str = "шт"
    manufacturer: str = ""
    part_number: str = ""
    notes: str = ""
    extra_fields: dict[str, str] = Field(default_factory=dict)
    print: PrintSettings = Field(default_factory=PrintSettings)


class DocumentationItem(BaseModel):
    id: str
    title: str
    kind: str = "markdown"
    url: str = ""
    body: str = ""
    description: str = ""
    component_id: str | None = None
    protocol_id: str | None = None


class AttachedFile(BaseModel):
    id: str
    filename: str
    kind: str = "other"
    mime: str = ""
    size: int = 0
    version: str = "1"
    description: str = ""
    uploaded_at: str = ""
    component_id: str | None = None


class TableColumn(BaseModel):
    id: str
    name: str
    type: str = "TEXT"
    nullable: bool = True
    default: str = ""
    primary_key: bool = False
    unique: bool = False
    foreign_key: str = ""
    description: str = ""


class TableIndex(BaseModel):
    id: str
    name: str
    columns: list[str] = Field(default_factory=list)
    unique: bool = False


class TableDefinition(BaseModel):
    schema_name: str = "public"
    description: str = ""
    columns: list[TableColumn] = Field(default_factory=list)
    indexes: list[TableIndex] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)


class DatabaseInfo(BaseModel):
    id: str
    name: str = "app"
    dialect: str = "postgresql"
    description: str = ""
    schema_name: str = "public"


class BomItem(BaseModel):
    component_id: str
    name: str
    category: str
    manufacturer: str = ""
    part_number: str = ""
    quantity: float = 1
    unit: str = "шт"
    notes: str = ""


class Connection(BaseModel):
    id: str
    architecture_id: str
    source: str
    target: str
    kind: ConnectionKind = "connection"
    protocol_id: str | None = None
    protocol_name: str = ""
    direction: Direction = "unidirectional"
    description: str = ""
    data_format: str = ""
    data_example: str = ""
    frequency: str = ""
    latency: str = ""
    reliability: str = ""
    notes: str = ""
    color: str = ""
    cardinality: str = ""
    source_column: str = ""
    target_column: str = ""


class Component(BaseModel):
    id: str
    architecture_id: str
    name: str
    type: str = "Custom Component"
    category: str = "OTHER"
    description: str = ""
    icon: str = "box"
    technology: str = ""
    version: str = ""
    status: str = "planned"
    tags: list[str] = Field(default_factory=list)
    owner: str = ""
    notes: str = ""
    position: Position = Field(default_factory=Position)
    nested_architecture_id: str | None = None
    documentation: Documentation = Field(default_factory=Documentation)
    hardware_id: str | None = None
    protocol_id: str | None = None
    requirement_ids: list[str] = Field(default_factory=list)
    modules: list[str] = Field(default_factory=list)
    api: str = ""
    state: str = ""
    technologies: list[str] = Field(default_factory=list)
    entity_kind: str = "component"
    mechanical: MechanicalData = Field(default_factory=MechanicalData)
    table: TableDefinition | None = None
    docs: list[DocumentationItem] = Field(default_factory=list)
    files: list[AttachedFile] = Field(default_factory=list)
    extra_fields: dict[str, str] = Field(default_factory=dict)


class Architecture(BaseModel):
    id: str
    project_id: str
    name: str
    parent_component_id: str | None = None
    description: str = ""
    kind: str = "system"


class Requirement(BaseModel):
    id: str
    code: str
    text: str
    component_ids: list[str] = Field(default_factory=list)
    connection_ids: list[str] = Field(default_factory=list)
    notes: str = ""
    priority: str = "should"


class Document(BaseModel):
    id: str
    title: str
    body: str = ""
    component_id: str | None = None
    protocol_id: str | None = None
    kind: str = "markdown"
    url: str = ""
    description: str = ""


class ArchitectureVersion(BaseModel):
    id: str
    label: str
    created_at: str
    snapshot: dict[str, Any] = Field(default_factory=dict)


class UserSettings(BaseModel):
    theme: Literal["light", "dark"] = "light"
    snap_to_grid: bool = True
    show_grid: bool = True
    grid_size: int = 20
    autosave: bool = True
    language: str = "ru"


class Project(BaseModel):
    id: str
    name: str
    description: str = ""
    created_at: str
    updated_at: str
    current_version_label: str = "v1"
    root_architecture_id: str
    architectures: list[Architecture] = Field(default_factory=list)
    components: list[Component] = Field(default_factory=list)
    connections: list[Connection] = Field(default_factory=list)
    protocols: list[Protocol] = Field(default_factory=list)
    hardware: list[HardwareComponent] = Field(default_factory=list)
    algorithms: list[Algorithm] = Field(default_factory=list)
    requirements: list[Requirement] = Field(default_factory=list)
    documents: list[Document] = Field(default_factory=list)
    custom_types: list[ComponentTypeDef] = Field(default_factory=list)
    versions: list[ArchitectureVersion] = Field(default_factory=list)
    settings: UserSettings = Field(default_factory=UserSettings)
    databases: list[DatabaseInfo] = Field(default_factory=list)


class ExportEnvelope(BaseModel):
    format: str = "architecture-canvas"
    format_version: str = "1.0"
    exported_at: str = ""
    system: dict[str, Any] = Field(default_factory=dict)
    components: list[dict[str, Any]] = Field(default_factory=list)
    connections: list[dict[str, Any]] = Field(default_factory=list)
    protocols: list[dict[str, Any]] = Field(default_factory=list)
    data_flows: list[dict[str, Any]] = Field(default_factory=list)
    algorithms: list[dict[str, Any]] = Field(default_factory=list)
    dependencies: list[dict[str, Any]] = Field(default_factory=list)
    requirements: list[dict[str, Any]] = Field(default_factory=list)
    hardware: list[dict[str, Any]] = Field(default_factory=list)
    documents: list[dict[str, Any]] = Field(default_factory=list)
    nested_architectures: list[dict[str, Any]] = Field(default_factory=list)
    mechanics: list[dict[str, Any]] = Field(default_factory=list)
    database: dict[str, Any] = Field(default_factory=dict)
    bom: list[dict[str, Any]] = Field(default_factory=list)
    project: dict[str, Any] = Field(default_factory=dict)


class AiExportRequest(BaseModel):
    task: str = ""
    rules: list[str] = Field(default_factory=list)
    scope: str = "all"
    component_ids: list[str] = Field(default_factory=list)
    architecture_id: str | None = None
    include_descriptions: bool = True
    include_algorithms: bool = True
    include_requirements: bool = True
    include_notes: bool = False
    include_doc_meta: bool = True
    include_full_docs: bool = False
    include_sql: bool = False


class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    template_id: str | None = None


class ProjectSummary(BaseModel):
    id: str
    name: str
    description: str = ""
    created_at: str
    updated_at: str
    current_version_label: str = "v1"
    component_count: int = 0


class GlobalSettings(BaseModel):
    theme: Literal["light", "dark"] = "light"
    snap_to_grid: bool = True
    show_grid: bool = True
    grid_size: int = 20
    autosave: bool = True
    language: str = "ru"
    display_name: str = "Архитектор"
