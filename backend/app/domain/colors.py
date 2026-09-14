"""Muted protocol colors for light canvases. Dark theme uses the same hues, slightly lifted in CSS."""

PROTOCOL_COLORS: dict[str, str] = {
    "HTTP": "#5d6f7c",
    "HTTPS": "#4f6474",
    "TCP": "#6a6e62",
    "UDP": "#7a6f5a",
    "MQTT": "#5d6a4e",
    "WebSocket": "#5a6278",
    "Modbus TCP": "#6b5c4a",
    "Modbus RTU": "#7a5e4e",
    "CAN": "#6a4e4e",
    "UART": "#4e6470",
    "Serial": "#4e6470",
    "SPI": "#5a5e6e",
    "I2C": "#4f6a66",
    "I²C": "#4f6a66",
    "USB": "#5c5870",
    "Ethernet": "#4a6270",
    "Wi-Fi": "#4e5f78",
    "OPC UA": "#5c5872",
    "OPC DA": "#6a5c72",
    "Custom Protocol": "#6e6a62",
    "Свой протокол": "#6e6a62",
}


def color_for_protocol(name: str, override: str | None = None) -> str:
    if override:
        return override
    if not name:
        return "#6e6b63"
    if name in PROTOCOL_COLORS:
        return PROTOCOL_COLORS[name]
    key = name.strip()
    for k, v in PROTOCOL_COLORS.items():
        if k.lower() == key.lower():
            return v
    return "#6e6b63"
