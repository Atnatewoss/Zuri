"""Build widget bundle by concatenating source modules in order."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULES_DIR = ROOT / "src" / "modules"
OUTPUT_FILE = ROOT / "src" / "zuri-widget.js"


def main() -> None:
    module_files = sorted(MODULES_DIR.glob("*.js"))
    if not module_files:
        raise RuntimeError(f"No modules found in: {MODULES_DIR}")

    parts: list[str] = []
    for module in module_files:
        text = module.read_text(encoding="utf-8").rstrip()
        parts.append(text)

    OUTPUT_FILE.write_text("\n\n".join(parts) + "\n", encoding="utf-8")
    print(f"Built {OUTPUT_FILE} from {len(module_files)} modules.")


if __name__ == "__main__":
    main()
