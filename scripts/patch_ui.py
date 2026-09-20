
def js_esc(t):
    return t.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").replace("\r", " ")

def dec(t):
    try:
        return bytes(t, "utf-8").decode("unicode_escape")
    except Exception:
        return t

def detail_for(qid, cat, q):
    if qid in DETAILS:
        return DETAILS[qid]
    if qid in SPEC:
        return SPEC[qid]
    hint = CAT.get(cat, "This extra line explains the question. It does not give the answer.")
    return hint + " Full question: " + q

UI = [
    (
        "[H,I]=(0,t.useState)(null),[q,P]=(0,t.useState)(!1)",
        "[H,I]=(0,t.useState)(null),[q,P]=(0,t.useState)(!1),[_fq,_fs]=(0,t.useState)(!1)",
    ),
    (
        "[M,_]=(0,t.useState)(null),[N,D]=(0,t.useState)(!1)",
        "[M,_]=(0,t.useState)(null),[N,D]=(0,t.useState)(!1),[_fq,_fs]=(0,t.useState)(!1)",
    ),
    ("I(null),P(!1)", "I(null),P(!1),_fs(!1)"),
    ("_(null),D(!1)", "_(null),D(!1),_fs(!1)"),
    (
        "[rt,nt]=(0,e.useState)(null)",
        "[rt,nt]=(0,e.useState)(null),[_fq,_fs]=(0,e.useState)(!1)",
    ),
    (
        "ot(!1),L+1>=W.length?st():$(t=>t+1)",
        "ot(!1),_fs(!1),L+1>=W.length?st():$(t=>t+1)",
    ),
    (
        '[(0,b.jsx)(n.default,{style:y.qText,children:V.question}),(0,b.jsx)(n.default,{style:y.qDetail,children:V.detail||""}),(0,b.jsx)(i.default,{style:y.detailBtn,onPress:function(){},children:(0,b.jsx)(n.default,{style:y.detailBtnText,children:"Click to view full question"})})]',
        '[(0,b.jsx)(n.default,{style:y.qText,children:V.question}),(0,b.jsx)(i.default,{style:y.detailBtn,onPress:()=>_fs(t=>!t),children:(0,b.jsx)(n.default,{style:y.detailBtnText,children:_fq?"Hide full question":"Click to view full question"})}),_fq&&V.detail?(0,b.jsx)(n.default,{style:y.qDetail,children:V.detail}):null]',
    ),
    (
        '[(0,b.jsx)(n.default,{style:y.qText,children:$.question}),(0,b.jsx)(n.default,{style:y.qDetail,children:$.detail||""}),(0,b.jsx)(i.default,{style:y.detailBtn,onPress:function(){},children:(0,b.jsx)(n.default,{style:y.detailBtnText,children:"Click to view full question"})})]',
        '[(0,b.jsx)(n.default,{style:y.qText,children:$.question}),(0,b.jsx)(i.default,{style:y.detailBtn,onPress:()=>_fs(t=>!t),children:(0,b.jsx)(n.default,{style:y.detailBtnText,children:_fq?"Hide full question":"Click to view full question"})}),_fq&&$.detail?(0,b.jsx)(n.default,{style:y.qDetail,children:$.detail}):null]',
    ),
    (
        'it.detail?(0,C.jsxs)(c.default,{children:[(0,C.jsx)(l.default,{style:b.note,children:it.detail}),(0,C.jsx)(i.default,{onPress:function(){},children:(0,C.jsx)(l.default,{style:b.note,children:"Click to view full question"})})]}):null',
        'it.detail?(0,C.jsxs)(c.default,{children:[(0,C.jsx)(i.default,{onPress:()=>_fs(t=>!t),children:(0,C.jsx)(l.default,{style:b.note,children:_fq?"Hide full question":"Click to view full question"})}),_fq?(0,C.jsx)(l.default,{style:b.note,children:it.detail}):null]}):null',
    ),
]

QRE = re.compile(
    r'\{id:"([^"]+)",category:"([^"]+)",question:"((?:\\.|[^"\\])+)",(?:detail:"(?:\\.|[^"\\])*",)?choices:\[((?:\\.|[^\[\]])*)\],correctIndex:(\d+)'
)

def patch(src):
    out = src
    for old, new in UI:
        n = out.count(old)
        print(("OK" if n else "WARN"), n, old[:70])
        if n and old != new:
            out = out.replace(old, new)
    inj = [0]
    def repl(m):
        qid, cat, qraw, ch, idx = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        d = detail_for(qid, cat, dec(qraw))
        inj[0] += 1
        return '{id:"%s",category:"%s",question:"%s",detail:"%s",choices:[%s],correctIndex:%s' % (
            qid, cat, qraw, js_esc(d), ch, idx
        )
    out = QRE.sub(repl, out)
    print("details", inj[0])
    return out

def main():
    if len(sys.argv) < 3:
        print("usage: patch-question-details.py IN.js OUT.js")
        return 2
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    dst.write_text(patch(src.read_text(encoding="utf-8", errors="ignore")), encoding="utf-8")
    print("wrote", dst, dst.stat().st_size)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
