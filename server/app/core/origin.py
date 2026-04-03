"""Shared origin parsing and allow-list checks for resort widget traffic."""

from __future__ import annotations

from urllib.parse import urlparse

from app.core.config import ENV


def normalize_origin(origin: str | None) -> str:
    return (origin or "").strip().lower().rstrip("/")


def origin_from_headers(origin: str | None, referer: str | None) -> str | None:
    normalized_origin = normalize_origin(origin)
    if normalized_origin:
        return normalized_origin

    parsed = urlparse((referer or "").strip())
    if not parsed.scheme or not parsed.netloc:
        return None
    return normalize_origin(f"{parsed.scheme}://{parsed.netloc}")


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


def is_development_loopback_origin(origin: str | None) -> bool:
    if ENV != "development":
        return False

    parsed = urlparse(normalize_origin(origin))
    return parsed.hostname in {"localhost", "127.0.0.1", "::1"}


def is_origin_allowed(allowed_domains: str, origin: str | None) -> bool:
    if is_development_loopback_origin(origin):
        return True

    allowed = normalize_allowed_domains(allowed_domains)
    if not allowed:
        return True
    return normalize_origin(origin) in allowed
