#!/usr/bin/env python3
"""Build the autonomous ZONT panel bundle from pinned local sources."""

from __future__ import annotations

import argparse
import hashlib
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "zont_local" / "frontend"
OUTPUT = FRONTEND / "zont-ui.js"
SHELL_SOURCE = FRONTEND / "nikas-specialized-shell.js"
APP_SOURCE = FRONTEND / "zont-app.js"
SHELL_SHA256 = "c7171560b68e2c4118b327c5e6a63c65e3410a4e1f10a02691e0d15560166e65"
UI_VERSION = "0.9.5"


def _read(path: Path) -> str:
    if not path.is_file():
        raise SystemExit(f"Missing frontend source: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8").rstrip()


def _embed(path: Path, source: str) -> str:
    relative = path.relative_to(ROOT).as_posix()
    return f"// BEGIN {relative}\n{source}\n// END {relative}"


def build() -> str:
    shell_bytes = SHELL_SOURCE.read_bytes()
    digest = hashlib.sha256(shell_bytes).hexdigest()
    if digest != SHELL_SHA256:
        raise SystemExit("Vendored NikaS shell source kit does not match canonical v2.1")

    shell = shell_bytes.decode("utf-8").rstrip()
    app = _read(APP_SOURCE)
    bundle = "\n".join(
        [
            "// GENERATED FILE. DO NOT EDIT DIRECTLY.",
            f"// ZONT autonomous UI {UI_VERSION} production bundle.",
            "// One active shell: zont-local-panel / NikaS shell kit v2.1.",
            "",
            _embed(SHELL_SOURCE, shell),
            "",
            _embed(APP_SOURCE, app),
            "",
        ]
    )

    executable = "\n".join(
        line for line in bundle.splitlines() if not line.lstrip().startswith("//")
    )
    if re.search(r"^\s*(?:import|export)\b", executable, re.MULTILINE):
        raise SystemExit("Generated bundle contains an ES module import/export")
    if re.search(r"\bimport\s*\(", executable):
        raise SystemExit("Generated bundle contains a dynamic runtime import")
    for forbidden in (
        "position:fixed",
        "100vh",
        "100vw",
        "/dashboard-house-v11",
        "history.back(",
    ):
        if forbidden in executable:
            raise SystemExit(f"Generated bundle contains forbidden legacy shell marker: {forbidden}")
    if bundle.count("customElements.define(ELEMENT_NAME, NikasGeneratedZont)") != 1:
        raise SystemExit("Generated bundle must register the ZONT component exactly once")
    for required in (
        'const NIKAS_SHELL_V2_VERSION = "2.1"',
        'const UI_VERSION = "0.9.5"',
        'shell.className = "nikas-shell"',
        "createNikasShellScrollBoundaryGuard",
        "captureNikasShellReturnRoute",
        "nikas-shell__viewport",
        "nikas-shell__content",
        "nikas-shell__tabs",
    ):
        if required not in bundle:
            raise SystemExit(f"Generated bundle is missing required marker: {required}")
    return bundle


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    content = build()
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text(encoding="utf-8") != content:
            raise SystemExit("Frontend production bundle is missing or stale")
        return
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({len(content)} bytes)")


if __name__ == "__main__":
    main()
