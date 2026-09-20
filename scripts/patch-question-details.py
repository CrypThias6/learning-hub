#!/usr/bin/env python3
"""Inject accurate grey detail text under every quiz question in the live bundle."""
from __future__ import annotations

import re
import sys
from pathlib import Path


def js_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").replace("\r", " ")


def decode_js_string(text: str) -> str:
    try:
        return bytes(text, "utf-8").decode("unicode_escape")
    except Exception:
        return text.encode("utf-8").decode("unicode_escape", errors="replace")
