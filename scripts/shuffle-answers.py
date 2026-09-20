#!/usr/bin/env python3
"""Spread correct answers across all four choice slots in Ken and Mum quizzes."""
from __future__ import annotations

import hashlib
import re
import sys
from collections import Counter
from pathlib import Path

QRE = re.compile(
    r'\{id:"((?:kq|mc)[^"]+)",category:"([^"]+)",question:"((?:\\.|[^"\\])+)",'
    r'(?:detail:"((?:\\.|[^"\\])*)",)?choices:\[((?:\\.|[^\[\]])*)\],correctIndex:(\d+)'
)
CHOICE_RE = re.compile(r'"((?:\\.|[^"\\])*)"')


def target_slot(qid: str, n: int) -> int:
    h = int(hashlib.md5(qid.encode("utf-8")).hexdigest(), 16)
    return h % n


def place_correct(choices: list[str], old_idx: int, new_idx: int) -> list[str]:
    correct = choices[old_idx]
    others = [c for i, c in enumerate(choices) if i != old_idx]
    seed = int(hashlib.md5((correct + str(new_idx)).encode()).hexdigest(), 16)
    for i in range(len(others) - 1, 0, -1):
        j = (seed + i * 17) % (i + 1)
        others[i], others[j] = others[j], others[i]
    others.insert(new_idx, correct)
    return others


def patch(src: str) -> str:
    moved = [0]
    dist = Counter()

    def repl(m: re.Match) -> str:
        qid, cat, qraw, detail, ch, idx_s = m.groups()
        idx = int(idx_s)
        choices = CHOICE_RE.findall(ch)
        if len(choices) < 2:
            return m.group(0)
        new_idx = target_slot(qid, len(choices))
        if new_idx != idx:
            moved[0] += 1
        new_choices = place_correct(choices, idx, new_idx)
        assert new_choices[new_idx] == choices[idx]
        dist[new_idx] += 1
        detail_part = f'detail:"{detail}",' if detail is not None else ""
        joined = ",".join(f'"{c}"' for c in new_choices)
        return (
            f'{{id:"{qid}",category:"{cat}",question:"{qraw}",{detail_part}'
            f"choices:[{joined}],correctIndex:{new_idx}"
        )

    out = QRE.sub(repl, src)
    print("moved", moved[0], "slots", dict(sorted(dist.items())), "total", sum(dist.values()))
    return out


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: shuffle-answers.py FILE.js")
        return 2
    path = Path(sys.argv[1])
    src = path.read_text(encoding="utf-8", errors="ignore")
    path.write_text(patch(src), encoding="utf-8")
    print("wrote", path, path.stat().st_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
