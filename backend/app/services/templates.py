from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.domain.library import BUILTIN_HARDWARE, BUILTIN_PROTOCOLS
from app.domain.schema import (
    Architecture,
    Component,
    Connection,
    Documentation,
    Position,
    Project,
    Protocol,
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _id() -> str:
    return str(uuid4())


def _arch(project_id: str, name: str) -> Architecture:
    return Architecture(id=_id(), project_id=project_id, name=name)


def _comp(
    architecture_id: str,
    name: str,
    type_: str,
    category: str,
    x: float,
    y: float,
    **kwargs,
) -> Component:
    return Component(
        id=_id(),
        architecture_id=architecture_id,
        name=name,
        type=type_,
        category=category,
        position=Position(x=x, y=y),
        **kwargs,
    )


def _conn(architecture_id: str, source: str, target: str, protocol_name: str, **kwargs) -> Connection:
    return Connection(
        id=_id(),
        architecture_id=architecture_id,
        source=source,
        target=target,
        protocol_name=protocol_name,
        **kwargs,
    )


def empty_project(name: str, description: str = "") -> Project:
    pid = _id()
    root = _arch(pid, name)
    now = _now()
    return Project(
        id=pid,
        name=name,
        description=description,
        created_at=now,
        updated_at=now,
        root_architecture_id=root.id,
        architectures=[root],
        protocols=[p.model_copy() for p in BUILTIN_PROTOCOLS],
        hardware=[h.model_copy() for h in BUILTIN_HARDWARE],
        documents=[],
    )


def web_application(name: str, description: str = "") -> Project:
    p = empty_project(name or "Web Application", description)
    aid = p.root_architecture_id
    fe = _comp(aid, "Frontend", "Frontend", "SOFTWARE", 80, 180, technology="React", icon="layout")
    be = _comp(aid, "Backend", "Backend", "SOFTWARE", 420, 180, technology="Python", icon="server")
    db = _comp(aid, "Database", "PostgreSQL", "DATA", 760, 80, technology="PostgreSQL", icon="db")
    redis = _comp(aid, "Redis", "Redis", "DATA", 760, 280, technology="Redis", icon="cache")
    p.components = [fe, be, db, redis]
    p.connections = [
        _conn(aid, fe.id, be.id, "HTTPS", data_format="JSON"),
        _conn(aid, be.id, db.id, "TCP", data_format="SQL"),
        _conn(aid, be.id, redis.id, "TCP", data_format="KV"),
    ]
    return p


def robot(name: str, description: str = "") -> Project:
    p = empty_project(name or "Robot", description)
    aid = p.root_architecture_id
    ctrl = _comp(aid, "Controller", "SBC", "HARDWARE", 420, 40, technology="Raspberry Pi", icon="board", hardware_id="hw-rpi")
    sensors = _comp(aid, "Sensors", "Sensor", "HARDWARE", 80, 220, icon="sensor")
    actuators = _comp(aid, "Actuators", "Actuator", "HARDWARE", 760, 220, icon="motor")
    comm = _comp(aid, "Communication", "MQTT", "PROTOCOL", 420, 220, icon="protocol", protocol_id="proto-mqtt")
    backend = _comp(aid, "Backend", "Backend", "SOFTWARE", 420, 400, technology="Python", icon="server")
    p.components = [ctrl, sensors, actuators, comm, backend]
    p.connections = [
        _conn(aid, sensors.id, ctrl.id, "UART", data_format="Float32"),
        _conn(aid, ctrl.id, actuators.id, "CAN", data_format="Frames"),
        _conn(aid, ctrl.id, comm.id, "MQTT", data_format="JSON"),
        _conn(aid, comm.id, backend.id, "MQTT", data_format="JSON"),
    ]
    return p


def iot(name: str, description: str = "") -> Project:
    p = empty_project(name or "IoT System", description)
    aid = p.root_architecture_id
    device = _comp(aid, "Device", "MCU", "HARDWARE", 80, 180, technology="ESP32", icon="chip", hardware_id="hw-esp32")
    mqtt = _comp(aid, "MQTT Broker", "MQTT", "PROTOCOL", 400, 180, icon="protocol", protocol_id="proto-mqtt")
    backend = _comp(aid, "Backend", "Backend", "SOFTWARE", 700, 80, technology="Python", icon="server")
    db = _comp(aid, "Database", "PostgreSQL", "DATA", 980, 80, icon="db")
    dash = _comp(aid, "Dashboard", "Frontend", "SOFTWARE", 700, 280, technology="React", icon="layout")
    p.components = [device, mqtt, backend, db, dash]
    p.connections = [
        _conn(aid, device.id, mqtt.id, "MQTT", data_format="JSON"),
        _conn(aid, mqtt.id, backend.id, "MQTT", data_format="JSON"),
        _conn(aid, backend.id, db.id, "TCP", data_format="SQL"),
        _conn(aid, dash.id, backend.id, "HTTPS", data_format="JSON", direction="bidirectional"),
    ]
    return p


def industrial(name: str, description: str = "") -> Project:
    p = empty_project(name or "Industrial Automation", description)
    aid = p.root_architecture_id
    plc = _comp(aid, "PLC", "PLC", "HARDWARE", 80, 180, icon="factory", hardware_id="hw-siemens-plc")
    hmi = _comp(aid, "HMI", "Application", "SOFTWARE", 400, 60, icon="layout")
    scada = _comp(aid, "SCADA", "Application", "SOFTWARE", 400, 220, icon="app")
    opc = _comp(aid, "OPC UA", "OPC UA", "PROTOCOL", 700, 180, icon="protocol", protocol_id="proto-opcua")
    db = _comp(aid, "Database", "PostgreSQL", "DATA", 980, 180, icon="db")
    p.components = [plc, hmi, scada, opc, db]
    p.connections = [
        _conn(aid, plc.id, hmi.id, "Modbus TCP"),
        _conn(aid, plc.id, scada.id, "OPC UA"),
        _conn(aid, scada.id, opc.id, "OPC UA"),
        _conn(aid, opc.id, db.id, "TCP", data_format="SQL"),
    ]
    return p


TEMPLATES = [
    {
        "id": "blank",
        "name": "Blank",
        "description": "Empty architecture canvas",
        "factory": empty_project,
    },
    {
        "id": "web",
        "name": "Web Application",
        "description": "Frontend, backend, database, Redis",
        "factory": web_application,
    },
    {
        "id": "robot",
        "name": "Robot",
        "description": "Controller, sensors, actuators, communication, backend",
        "factory": robot,
    },
    {
        "id": "iot",
        "name": "IoT",
        "description": "Device, MQTT, backend, database, dashboard",
        "factory": iot,
    },
    {
        "id": "industrial",
        "name": "Industrial Automation",
        "description": "PLC, HMI, SCADA, OPC UA, database",
        "factory": industrial,
    },
]


def create_from_template(template_id: str | None, name: str, description: str) -> Project:
    factory = empty_project
    for t in TEMPLATES:
        if t["id"] == (template_id or "blank"):
            factory = t["factory"]
            break
    return factory(name, description)


def clone_as_template(project: Project, name: str) -> dict:
    return {
        "id": _id(),
        "name": name,
        "description": project.description,
        "snapshot": project.model_dump(),
    }
