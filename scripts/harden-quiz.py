#!/usr/bin/env python3
"""Make MCQ options similarly hard and stop extra text naming the answer."""
from pathlib import Path
import re
import sys

HERE = Path(__file__).resolve().parent
SEARCH = [HERE, Path("/tmp"), Path("/home/workdir/artifacts")]

QRE = re.compile(
    r'\{id:"([^"]+)",category:"([^"]+)",question:"((?:\\.|[^"\\])+)",'
    r'(?:detail:"(?:\\.|[^"\\])*",)?choices:\[((?:\\.|[^\[\]])*)\],correctIndex:(\d+)'
)


def js_esc(t):
    return (
        t.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", " ")
        .replace("\r", " ")
    )


def dec(t):
    try:
        return bytes(t, "utf-8").decode("unicode_escape")
    except Exception:
        return t.replace("\\u2014", "\u2014").replace("\\u2019", "'").replace("\\u2026", "...")


def load_fixes():
    ns = {}
    parts = []
    for root in SEARCH:
        parts.extend(sorted(root.glob("harden_part_*.py")))
        parts.extend(sorted(root.glob("harden_data*.py")))
    seen = set()
    for p in parts:
        if p.name in seen:
            continue
        seen.add(p.name)
        try:
            exec(compile(p.read_text(encoding="utf-8"), str(p), "exec"), ns)
        except Exception as e:
            print("skip", p, e)
    fix = {}
    for name in ["HA", "HB", "HC", "HD", "HE", "HF", "HG", "HH", "HI"]:
        fix.update(ns.get(name, {}))
    print("loaded_fix_ids", len(fix))
    return fix


def leak(detail, answer):
    a = (answer or "").strip().lower()
    d = (detail or "").lower()
    if len(a) >= 5 and a in d:
        return True
    words = [w for w in re.findall(r"[A-Za-z']+", answer or "") if len(w) > 4]
    if len(words) >= 2 and " ".join(words[:2]).lower() in d:
        return True
    return False


def safe_detail(qid, question, answer, existing=""):
    q = dec(question)
    if existing and not leak(existing, answer):
        return existing
    return (
        "This extra line explains the task, not the answer. "
        "Read the short question again. The four options are all real ideas from the same topic. "
        "Pick the one that matches the question, not a nearby idea."
    )


def similar_pool(ans, pool):
    al = len(ans)
    scored = []
    for p in pool:
        if p == ans:
            continue
        if not p:
            continue
        scored.append((abs(len(p) - al), -len(p), p))
    scored.sort()
    out = []
    for _, __, p in scored:
        if p not in out:
            out.append(p)
        if len(out) >= 8:
            break
    return out


def patch(src, fix):
    parsed = []
    for m in QRE.finditer(src):
        qid, cat, qraw, ch, idx = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        choices = [dec(x) for x in re.findall(r'"((?:\\.|[^"\\])*)"', ch)]
        i = int(idx)
        ans = choices[i] if i < len(choices) else ""
        parsed.append((qid, cat, ans, choices))
    by_cat = {}
    for qid, cat, ans, choices in parsed:
        by_cat.setdefault(cat, []).append(ans)

    used_fix = [0]
    used_auto = [0]

    def repl(m):
        qid, cat, qraw, ch, idx = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        old_choices = [dec(x) for x in re.findall(r'"((?:\\.|[^"\\])*)"', ch)]
        old_idx = int(idx)
        ans = old_choices[old_idx] if old_idx < len(old_choices) else ""
        if qid in fix:
            w1, w2, w3, detail = fix[qid]
            wrongs = [w1, w2, w3]
            used_fix[0] += 1
        else:
            pool = similar_pool(ans, by_cat.get(cat, []))
            # keep any existing wrong that is already long enough
            existing = [c for i, c in enumerate(old_choices) if i != old_idx and len(c) >= max(8, int(len(ans) * 0.55))]
            wrongs = []
            for c in existing + pool:
                if c != ans and c not in wrongs:
                    wrongs.append(c)
                if len(wrongs) == 3:
                    break
            while len(wrongs) < 3:
                wrongs.append(ans + " — nearby idea from the same topic")
            detail = safe_detail(qid, qraw, ans)
            used_auto[0] += 1
        detail = safe_detail(qid, qraw, ans, detail)
        slot = (sum(ord(c) for c in qid) + old_idx) % 4
        choices = list(wrongs[:3])
        choices.insert(slot, ans)
        ch_js = ",".join(f'"{js_esc(c)}"' for c in choices)
        return (
            '{id:"%s",category:"%s",question:"%s",detail:"%s",choices:[%s],correctIndex:%s'
            % (qid, cat, qraw, js_esc(detail), ch_js, slot)
        )

    out = QRE.sub(repl, src)
    print("fix", used_fix[0], "auto", used_auto[0])
    return out


def main():
    if len(sys.argv) < 2:
        print("usage: harden-quiz.py FILE.js")
        return 2
    path = Path(sys.argv[1])
    fix = load_fixes()
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
