"""Keep-alive ping for deployed backend health endpoint.

Used by Render Cron service to reduce cold starts on sleeping plans.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    url = (os.getenv("BACKEND_HEALTH_URL") or "").strip()
    if not url:
        print("BACKEND_HEALTH_URL is not set.")
        return 1

    try:
        req = urllib.request.Request(
            url=url,
            method="GET",
            headers={"User-Agent": "zuri-keepalive/1.0"},
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            status = int(resp.status)
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as exc:
        print(f"Ping failed: {exc}")
        return 1

    if status < 200 or status >= 300:
        print(f"Ping failed with HTTP {status}: {body[:500]}")
        return 1

    # Health endpoint returns JSON; print compact diagnostics for cron logs.
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        payload = {"raw": body[:200]}
    print(f"Ping ok: {json.dumps(payload, separators=(',', ':'))}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
