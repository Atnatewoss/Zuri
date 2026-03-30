"""Shared origin parsing and allow-list checks for resort widget traffic."""

from __future__ import annotations

from app.core.config import ENV


def normalize_origin(origin: str | None) -> str:
    return (origin or "").strip().lower().rstrip("/")


def normalize_allowed_domains(allowed_domains: str) -> set[str]:
    protocol = "http://" if ENV == "development" else "https://"
    allowed_set: set[str] = set()
    for domain in allowed_domains.split(","):
        value = domain.strip().lower().rstrip("/")
        if not value:
            continue
        if not value.startswith("http://") and not value.startswith("https://"):
            value = protocol + value
        allowed_set.add(value)
    return allowed_set


def is_origin_allowed(allowed_domains: str, origin: str | None) -> bool:
    allowed = normalize_allowed_domains(allowed_domains)
    if not allowed:
        return True
    return normalize_origin(origin) in allowed
