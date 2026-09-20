
def js_esc(t):
    return t.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").replace("\r", " ")

def dec(t):
    try:
        return bytes(t, "utf-8").decode("unicode_escape")
    except Exception:
        return t

def detail_for(qid, cat, q):
    if qid in SPEC:
        return SPEC[qid]
    ql = q.lower()
    if "stand for" in ql:
        return "This is an acronym. Expand every official letter; do not invent a similar phrase. Full question: " + q
    if "how many" in ql:
        return "This needs the standard official number, not a nearby look-alike figure. Full question: " + q
    if "worth" in ql and any(w in ql for w in ("point", "score", "try", "goal", "bullseye")):
        return "This asks for the official point value in that sport's usual rules. Full question: " + q
    if ql.startswith("where ") or "located" in ql or "found in" in ql:
        return "Picture the place on the body, map, or gear, then match the best description. Full question: " + q
    if "capital" in ql:
        return "Name the official political capital. In some countries that is not the largest city. Full question: " + q
    if "largest city" in ql:
        return "This asks for the biggest city by people, which may not be the capital. Full question: " + q
    if "watl" in ql:
        return "Use World Axe Throwing League rules here, not IATF scoring. Full question: " + q
    if "iatf" in ql:
        return "Use International Axe Throwing Federation rules. They are not identical to WATL. Full question: " + q
    if "nzac" in ql:
        return "Stay with NZAC documents and New Zealand counselling practice. Full question: " + q
    if "te tiriti" in ql or "treaty" in ql:
        return "This is about Te Tiriti o Waitangi in counselling and helping work in Aotearoa. Full question: " + q
    if "gvm" in ql:
        return "GVM is the maximum loaded weight allowed for that one vehicle. Full question: " + q
    if "istanbul" in ql:
        return "Istanbul is Turkey's huge historic city on the Bosporus, not the inland capital. Full question: " + q
    if "massey" in ql or "pgdip" in ql:
        return "This is about Massey's postgraduate counselling qualification and NZQF level. Full question: " + q
    if "supervision" in ql:
        return "Supervision is a regular professional conversation that keeps practice safe and skilful. Full question: " + q
    if "confidentiality" in ql:
        return "Confidentiality is the usual rule, with safety limits when serious harm is imminent. Full question: " + q
    if "colic" in ql:
        return "Colic means abdominal pain in horses and can be an emergency. Full question: " + q
    hint = CAT.get(cat, "Read the full question again. This line only explains the task; it does not give the answer.")
    return hint + " Full question: " + q

UI = [
    (
        "question:String(t.question||''),choices:i,correctIndex:",
        "question:String(t.question||''),detail:t.detail?String(t.detail):void 0,choices:i,correctIndex:",
    ),
    (
        "[H,I]=(0,t.useState)(null),[q,P]=(0,t.useState)(!1)",
        "[H,I]=(0,t.useState)(null),[q,P]=(0,t.useState)(!1),[G,K]=(0,t.useState)(!1)",
    ),
    (
        "I(null),P(!1)",
        "I(null),P(!1),K(!1)",
    ),
    (
        "[M,_]=(0,t.useState)(null),[N,D]=(0,t.useState)(!1)",
        "[M,_]=(0,t.useState)(null),[N,D]=(0,t.useState)(!1),[G,K]=(0,t.useState)(!1)",
    ),
    (
        "_(null),D(!1)",
        "_(null),D(!1),K(!1)",
    ),
    (
        "[rt,nt]=(0,e.useState)(null)",
        "[rt,nt]=(0,e.useState)(null),[pt,ht]=(0,e.useState)(!1)",
    ),
    (
        "ot(!1),L+1>=W.length?st():$(t=>t+1)",
        "ot(!1),ht(!1),L+1>=W.length?st():$(t=>t+1)",
    ),
    (
        "[(0,b.jsx)(n.default,{style:y.qText,children:V.question}),V.detail?(0,b.jsx)(n.default,{style:y.qDetail,children:V.detail}):null]",
        "[(0,b.jsx)(n.default,{style:y.qText,children:V.question}),V.detail?(0,b.jsxs)(c.default,{style:y.detailWrap,children:[(0,b.jsx)(i.default,{style:y.detailBtn,onPress:()=>K(t=>!t),children:(0,b.jsx)(n.default,{style:y.detailBtnText,children:G?\"Hide full question\":\"Click to view full question\"})}),G?(0,b.jsx)(n.default,{style:y.qDetail,children:V.detail}):null]}):null]",
    ),
    (
        "[(0,b.jsx)(n.default,{style:y.qText,children:$.question}),$.detail?(0,b.jsx)(n.default,{style:y.qDetail,children:$.detail}):null]",
        "[(0,b.jsx)(n.default,{style:y.qText,children:$.question}),$.detail?(0,b.jsxs)(c.default,{style:y.detailWrap,children:[(0,b.jsx)(i.default,{style:y.detailBtn,onPress:()=>K(t=>!t),children:(0,b.jsx)(n.default,{style:y.detailBtnText,children:G?\"Hide full question\":\"Click to view full question\"})}),G?(0,b.jsx)(n.default,{style:y.qDetail,children:$.detail}):null]}):null]",
    ),
    (
        "qDetail:{color:u.colors.muted,fontSize:13,fontWeight:'500',lineHeight:18,marginTop:8}",
        "qDetail:{color:u.colors.muted,fontSize:13,fontWeight:'500',lineHeight:18,marginTop:8},detailWrap:{marginTop:8},detailBtn:{alignSelf:'flex-start',marginTop:8,paddingVertical:8,paddingHorizontal:12,borderRadius:999,borderWidth:1,borderColor:u.colors.border,backgroundColor:u.colors.cardAlt},detailBtnText:{color:u.colors.muted,fontSize:13,fontWeight:'700'}",
    ),
    (
        "it.detail?(0,C.jsx)(l.default,{style:b.note,children:it.detail}):null",
        "it.detail?(0,C.jsxs)(c.default,{children:[(0,C.jsx)(i.default,{onPress:()=>ht(t=>!t),children:(0,C.jsx)(l.default,{style:b.note,children:pt?\"Hide full question\":\"Click to view full question\"})}),pt?(0,C.jsx)(l.default,{style:b.note,children:it.detail}):null]}):null",
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
        if n:
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
