#!/usr/bin/env python3
"""Turn official scoring on in the Pages JS bundle and drop week wording."""
from pathlib import Path
import sys

REPLACES = [
    (
        "r.exports={started:!1,startedAt:null}",
        "r.exports={started:!0,startedAt:null}",
    ),
    (
        "Only official-subject runs after the week started.",
        "Only official-subject runs.",
    ),
    (
        "Practice only \u2014 these won\u2019t count as official when the week begins.",
        "Practice scores. Official subject runs count on the graph.",
    ),
    (
        "Practice mode \u2014 the official week hasn\u2019t started yet.",
        "Practice mode.",
    ),
    (
        "Play anytime to practice. Official scores begin when Matt starts the competition week.",
        "Play anytime to practice.",
    ),
    (
        " (once the week starts)",
        "",
    ),
    (
        "Competition on \u2014 only your official subject counts on the graph.",
        "Only your official subject counts on the graph.",
    ),
    (
        "Competition is on",
        "Official scores",
    ),
]


def main():
    if len(sys.argv) < 2:
        print("usage: start-official.py FILE.js")
        return 2
    path = Path(sys.argv[1])
    src = path.read_text(encoding="utf-8", errors="ignore")
    out = src
    for old, new in REPLACES:
        n = out.count(old)
        print(("OK" if n else "WARN"), n, old[:70])
        if n:
            out = out.replace(old, new)
    path.write_text(out, encoding="utf-8")
    print("wrote", path, path.stat().st_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
