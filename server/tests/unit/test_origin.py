import pytest

from app.core import origin


def test_normalize_origin_strips_and_lowercases():
    assert origin.normalize_origin("https://Example.COM/Some/Path/") == "https://example.com/some/path"


def test_origin_from_headers_prefers_origin_header():
    assert (
        origin.origin_from_headers("https://example.com", "https://badreferer.com")
        == "https://example.com"
    )


def test_origin_from_headers_uses_referer_when_origin_missing():
    assert origin.origin_from_headers(None, "https://portal.example.com/welcome") == "https://portal.example.com"


def test_normalize_allowed_domains_defaults_to_insecure_http():
    allowed = origin.normalize_allowed_domains("example.com, https://secure.example.com")
    assert "http://example.com" in allowed
    assert "https://secure.example.com" in allowed


def test_is_development_loopback_origin_detects_localhost(monkeypatch):
    monkeypatch.setattr(origin, "ENV", "development")
    assert origin.is_development_loopback_origin("http://localhost:3000")
    assert origin.is_development_loopback_origin("http://127.0.0.1:8000")


def test_is_origin_allowed_respects_allowlist(monkeypatch):
    monkeypatch.setattr(origin, "ENV", "production")
    assert origin.is_origin_allowed("example.com", "https://example.com/")
    assert not origin.is_origin_allowed("example.com", "https://not-in-allowlist.com")


def test_is_origin_allowed_allows_empty_list():
    assert origin.is_origin_allowed("", "https://whatever.com")
