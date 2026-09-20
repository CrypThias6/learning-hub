#!/usr/bin/env python3
"""Shuffle MCQ answer order each session so the correct choice is not stuck in one slot."""
from pathlib import Path
import sys

OLD = "function n(n,i){const o=t(n);return'full'===i?o:o.slice(0,Math.min(i,o.length))}"
NEW = (
    "function n(n,i){const o=t(n),s='full'===i?o:o.slice(0,Math.min(i,o.length));"
    "return s.map(function(q){const ch=q.choices||[],idx=q.correctIndex,"
    "pairs=t(ch.map(function(c,i){return[c,i]}));"
    "return Object.assign({},q,{choices:pairs.map(function(p){return p[0]}),"
    "correctIndex:Math.max(0,pairs.findIndex(function(p){return p[1]===idx}))})})}"
)


def main():
    if len(sys.argv) < 2:
        print("usage: shuffle-choices.py FILE.js")
        return 2
    path = Path(sys.argv[1])
    out = path.read_text(encoding="utf-8", errors="ignore")
    n = out.count(OLD)
    print(("OK" if n == 1 else "WARN"), n, OLD[:70])
    if n:
        out = out.replace(OLD, NEW)
    path.write_text(out, encoding="utf-8")
    print("wrote", path, path.stat().st_size)
    print("new", out.count(NEW), "old leftover", out.count(OLD))
    return 0 if n == 1 else 1


if __name__ == "__main__":
    raise SystemExit(main())
