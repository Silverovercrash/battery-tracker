# SPDX-License-Identifier: MIT
"""Authenticated shared storage for the Akku-Tracker."""
from __future__ import annotations

import json
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

DOMAIN = "akku_tracker"
EVENT_UPDATED = "akku_tracker_updated"
STORAGE_VERSION = 1
STORAGE_KEY = "akku_tracker_data"
MAX_STORAGE_BYTES = 2_000_000


def _load_default_data() -> dict[str, Any]:
    """Start fresh installations without a private inventory."""
    return {"batteries": [], "devices": [], "history": []}


def _validate_data(data: Any) -> str | None:
    """Validate the shared inventory shape and keep storage bounded."""
    if not isinstance(data, dict):
        return "Die Daten müssen ein Objekt sein."
    for key in ("batteries", "devices", "history"):
        if not isinstance(data.get(key), list):
            return f"Der Bereich {key} fehlt oder ist ungültig."
        if len(data[key]) > 5000:
            return f"Zu viele Einträge in {key}."
    try:
        raw = json.dumps(data, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    except (TypeError, ValueError):
        return "Die Daten enthalten einen ungültigen Wert."
    if len(raw.encode("utf-8")) > MAX_STORAGE_BYTES:
        return "Die Datenbank ist größer als 2 MB."
    for key in ("batteries", "devices", "history"):
        if any(not isinstance(item, dict) for item in data[key]):
            return f"Ein Eintrag in {key} ist ungültig."
    return None


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get"})
@websocket_api.async_response
async def websocket_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Return the single shared battery database to an authenticated HA session."""
    entry = hass.data.get(DOMAIN)
    if entry is None:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_FOUND, "Akku-Tracker ist nicht geladen.")
        return
    connection.send_result(msg["id"], {"data": entry["data"]})


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/save",
    vol.Required("data"): dict,
})
@websocket_api.async_response
async def websocket_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Validate and persist all tracker data atomically through HA storage."""
    entry = hass.data.get(DOMAIN)
    if entry is None:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_FOUND, "Akku-Tracker ist nicht geladen.")
        return
    data = msg["data"]
    problem = _validate_data(data)
    if problem:
        connection.send_error(msg["id"], websocket_api.const.ERR_INVALID_FORMAT, problem)
        return
    try:
        await entry["store"].async_save(data)
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], websocket_api.const.ERR_UNKNOWN_ERROR, f"Speichern fehlgeschlagen: {err}")
        return
    entry["data"] = data
    hass.bus.async_fire(EVENT_UPDATED, {"data": data, "user_id": connection.user.id if connection.user else None})
    connection.send_result(msg["id"], {"saved": True})


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up durable storage and the protected frontend commands."""
    store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
    data = await store.async_load()
    if data is None:
        data = await hass.async_add_executor_job(_load_default_data)
        problem = _validate_data(data)
        if problem:
            raise ValueError(f"Ungültiger Startbestand für den Akku-Tracker: {problem}")
        await store.async_save(data)
    else:
        problem = _validate_data(data)
        if problem:
            raise ValueError(f"Ungültige gespeicherte Akku-Tracker-Daten: {problem}")
    hass.data[DOMAIN] = {"store": store, "data": data}
    websocket_api.async_register_command(hass, websocket_get)
    websocket_api.async_register_command(hass, websocket_save)
    return True
