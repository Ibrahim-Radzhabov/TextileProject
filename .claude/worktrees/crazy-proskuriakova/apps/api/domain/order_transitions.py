import json
from functools import lru_cache
from pathlib import Path
from typing import Dict, Set

_REPO_ROOT = Path(__file__).resolve().parents[3]
_TRANSITIONS_PATH = _REPO_ROOT / "packages" / "shared-types" / "src" / "order-status-transitions.json"


@lru_cache(maxsize=1)
def get_manual_status_transitions() -> Dict[str, Set[str]]:
    if not _TRANSITIONS_PATH.exists():
        raise RuntimeError(f"Order transitions file not found: {_TRANSITIONS_PATH}")

    raw_payload = json.loads(_TRANSITIONS_PATH.read_text(encoding="utf-8"))
    if not isinstance(raw_payload, dict):
        raise RuntimeError("Order transitions payload must be an object")

    normalized: Dict[str, Set[str]] = {}
    for from_status, to_statuses in raw_payload.items():
        if not isinstance(from_status, str):
            raise RuntimeError("Order transitions key must be a string")
        if not isinstance(to_statuses, list):
            raise RuntimeError("Order transitions value must be an array")

        allowed_values: Set[str] = set()
        for to_status in to_statuses:
            if not isinstance(to_status, str):
                raise RuntimeError("Order transitions item must be a string")
            allowed_values.add(to_status)
        normalized[from_status] = allowed_values

    return normalized


def get_allowed_manual_statuses(status: str) -> Set[str]:
    transitions = get_manual_status_transitions()
    return transitions.get(status, set())
