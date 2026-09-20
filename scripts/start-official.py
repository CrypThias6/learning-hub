#!/usr/bin/env python3
"""Turn official scoring on in the Pages JS bundle. Drop week-duration wording."""
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
        "Play anytime to practice. Official scores begin when Matt starts the competition week.",
        "Same metric for everyone: session % on your official subject.",
    ),
    (
        " (once the week starts)",
        "",
    ),
    (
        "Practice mode \\u2014 the official week hasn\\u2019t started yet.",
        "Official scores are live.",
    ),
    (
        "Practice only \\u2014 these won\\u2019t count as official when the week begins.",
        "Practice scores stay on this device. Official subject runs count on the graph.",
    ),
    (
        "Competition on \\u2014 only your official subject counts on the graph.",
        "Only your official subject counts on the graph.",
    ),
]


def main():
    if len(sys.argv) < 2:
        print("usage: start-official.py FILE.js")
        return 2
    path = Path(sys.argv[1])
    out = path.read_text(encoding="utf-8", errors="ignore")
    for old, new in REPLACES:
        n = out.count(old)
        print(("OK" if n else "WARN"), n, old[:72])
        if n:
            out = out.replace(old, new)
    path.write_text(out, encoding="utf-8")
    print("wrote", path, path.stat().st_size)
    print("started flag", out.count("r.exports={started:!0,startedAt:null}"))
    print(
        "week leftovers",
        out.count("competition week"),
        out.count("official week"),
        out.count("week starts"),
        out.count("week begins"),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
