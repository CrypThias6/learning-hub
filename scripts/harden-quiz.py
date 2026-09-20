#!/usr/bin/env python3
"""Make MCQ options similarly hard and stop extra text naming the answer."""
from pathlib import Path
import re
import sys

HERE = Path(__file__).resolve().parent
SEARCH = [HERE, Path("/tmp"), Path("/home/workdir/artifacts")]


def js_esc(t):
    return (
        t.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", " ")
        .replace("\r", " ")
    )


def load_fixes():
    ns = {}
    parts = []
    for root in SEARCH:
        parts.extend(sorted(root.glob("harden_part_*.py")))
    if not parts:
        raise SystemExit("harden_part_*.py not found")
    seen = set()
    for p in parts:
        if p.name in seen:
            continue
        seen.add(p.name)
        exec(compile(p.read_text(encoding="utf-8"), str(p), "exec"), ns)
    fix = {}
    for name in ["HA", "HB", "HC", "HD", "HE", "HF", "HG", "HH", "HI"]:
        fix.update(ns.get(name, {}))
    return fix


QRE = re.compile(
    r'\{id:"([^"]+)",category:"([^"]+)",question:"((?:\\.|[^"\\])+)",'
    r'(?:detail:"(?:\\.|[^"\\])*",)?choices:\[((?:\\.|[^\[\]])*)\],correctIndex:(\d+)'
)


def leak(detail, answer):
    a = answer.strip().lower()
    d = detail.lower()
    if len(a) >= 5 and a in d:
        return True
    words = [w for w in re.findall(r"[a-zA-Z']+", answer) if len(w) > 4]
    if len(words) >= 2 and " ".join(words[:2]).lower() in d:
        return True
    return False


def patch(src, fix):
    used = [0]
    leaked = [0]

    def repl(m):
        qid, cat, qraw, ch, idx = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        old_choices = re.findall(r'"((?:\\.|[^"\\])*)"', ch)
        old_idx = int(idx)
        old_ans = old_choices[old_idx] if old_idx < len(old_choices) else ""
        ans_plain = bytes(old_ans, "utf-8").decode("unicode_escape") if "\\" in old_ans else old_ans
        if qid in fix:
            w1, w2, w3, detail = fix[qid]
            slot = (sum(ord(c) for c in qid) + old_idx) % 4
            choices = [w1, w2, w3]
            choices.insert(slot, ans_plain)
            new_idx = slot
            if leak(detail, ans_plain):
                leaked[0] += 1
                detail = (
                    "This question stays inside the same topic as the short line above. "
                    "The four options are all real ideas from that topic. "
                    "Match the short question; do not pick a nearby idea."
                )
            used[0] += 1
        else:
            return m.group(0)
        ch_js = ",".join(f'"{js_esc(c)}"' for c in choices)
        return (
            '{id:"%s",category:"%s",question:"%s",detail:"%s",choices:[%s],correctIndex:%s'
            % (qid, cat, qraw, js_esc(detail), ch_js, new_idx)
        )

    out = QRE.sub(repl, src)
    print("hardened", used[0], "leak_rewritten", leaked[0])
    return out


def main():
    if len(sys.argv) < 2:
        print("usage: harden-quiz.py FILE.js")
        return 2
    path = Path(sys.argv[1])
    fix = load_fixes()
    print("fixes", len(fix))
    src = path.read_text(encoding="utf-8", errors="ignore")
    out = patch(src, fix)
    if out == src:
        print("no changes written")
        return 1
    path.write_text(out, encoding="utf-8")
    print("wrote", path, path.stat().st_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
