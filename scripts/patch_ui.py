def detail_for(qid, cat, q):
    if qid in SPEC:
        return SPEC[qid]
    ql = q.lower()
    if "stand for" in ql:
        return "This is an acronym. Expand every official letter; do not invent a similar phrase."
    if "how many" in ql:
        return "This needs the standard official number, not a nearby look-alike figure."
    if "worth" in ql and any(w in ql for w in ("point", "score", "try", "goal", "bullseye")):
        return "This asks for the official point value in that sport's usual rules."
    if ql.startswith("where ") or "located" in ql or "found in" in ql:
        return "Picture the place on the body, map, or gear, then match the best description."
    if "capital" in ql:
        return "Name the official political capital. In some countries that is not the largest city."
    if "largest city" in ql:
        return "This asks for the biggest city by people, which may not be the capital."
    if "watl" in ql:
        return "Use World Axe Throwing League rules here, not IATF scoring."
    if "iatf" in ql:
        return "Use International Axe Throwing Federation rules. They are not identical to WATL."
    if "nzac" in ql:
        return "Stay with NZAC documents and New Zealand counselling practice."
    if "te tiriti" in ql or "treaty" in ql:
        return "This is about Te Tiriti o Waitangi in counselling and helping work in Aotearoa."
    if "gvm" in ql:
        return "GVM is the maximum loaded weight allowed for that one vehicle."
    if "istanbul" in ql:
        return "Istanbul is Turkey's huge historic city on the Bosporus, not the inland capital."
    if "massey" in ql or "pgdip" in ql:
        return "This is about Massey's postgraduate counselling qualification and NZQF level."
    if "supervision" in ql:
        return "Supervision is a regular professional conversation that keeps practice safe and skilful."
    if "confidentiality" in ql:
        return "Confidentiality is the usual rule, with safety limits when serious harm is imminent."
    if "colic" in ql:
        return "Colic means abdominal pain in horses and can be an emergency."
    return CAT.get(cat, "Read the full question again. This grey line only explains the task; it does not give the answer.")

UI = [
    ("(0,b.jsx)(c.default,{style:y.qCard,children:(0,b.jsx)(n.default,{style:y.qText,children:V.question})})",
     "(0,b.jsxs)(c.default,{style:y.qCard,children:[(0,b.jsx)(n.default,{style:y.qText,children:V.question}),V.detail?(0,b.jsx)(n.default,{style:y.qDetail,children:V.detail}):null]})"),
    ("(0,b.jsx)(c.default,{style:y.qCard,children:(0,b.jsx)(n.default,{style:y.qText,children:$.question})})",
     "(0,b.jsxs)(c.default,{style:y.qCard,children:[(0,b.jsx)(n.default,{style:y.qText,children:$.question}),$.detail?(0,b.jsx)(n.default,{style:y.qDetail,children:$.detail}):null]})"),
    ("qText:{color:u.colors.text,fontSize:18,fontWeight:'700',lineHeight:26}",
     "qText:{color:u.colors.text,fontSize:18,fontWeight:'700',lineHeight:26},qDetail:{color:u.colors.muted,fontSize:13,fontWeight:'500',lineHeight:18,marginTop:8}"),
    ('(0,C.jsx)(l.default,{style:b.prompt,children:it.prompt}),dt&&it.note&&v',
     '(0,C.jsx)(l.default,{style:b.prompt,children:it.prompt}),it.detail?(0,C.jsx)(l.default,{style:b.note,children:it.detail}):null,dt&&it.note&&v'),
    ("prompt:`What is the capital of ${n.name}?`,countryId:n.id",
     "prompt:`What is the capital of ${n.name}?`,detail:`Name the official capital city of ${n.name}. A few countries have more than one capital - use the usual school-atlas answer unless a note says otherwise.`,countryId:n.id"),
    ("prompt:`Which is a major city in ${c.name}?`,countryId:c.id",
     "prompt:`Which is a major city in ${c.name}?`,detail:`Choose a well-known city that is inside ${c.name}. Do not pick a city from a neighbouring country.`,countryId:c.id"),
    ("prompt:`What\\u2019s a fact about ${a}?`,countryId:i.id",
     "prompt:`What\\u2019s a fact about ${a}?`,detail:`Pick a true fact about this place. Use the study cards; wrong cards belong to other places.`,countryId:i.id"),
    ("prompt:`Tap the map where ${t.name} is`,countryId:t.countryId",
     "prompt:`Tap the map where ${t.name} is`,detail:`Tap as close as you can to the real map location of ${t.name}. Closer taps score better.`,countryId:t.countryId"),
    ("prompt:`Which country is ${n.name} in?`,countryId:c.id",
     "prompt:`Which country is ${n.name} in?`,detail:`Choose the country that ${n.name} belongs to. Nearby countries are often used as look-alike answers.`,countryId:c.id"),
]

QRE = re.compile(r'\{id:"([^"]+)",category:"([^"]+)",question:"((?:\\.|[^"\\])+)",choices:\[((?:\\.|[^\[\]])*)\],correctIndex:(\d+)')

def patch(src):
    out = src
    for old, new in UI:
        n = out.count(old)
        print(("OK" if n else "WARN"), n, old[:50])
        if n:
            out = out.replace(old, new)
    inj = [0]
    def repl(m):
        qid, cat, qraw, ch, idx = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        whole = m.group(0)
        if ",detail:\"" in whole:
            return whole
        d = detail_for(qid, cat, dec(qraw))
        inj[0] += 1
        return '{id:"%s",category:"%s",question:"%s",detail:"%s",choices:[%s],correctIndex:%s' % (qid, cat, qraw, js_esc(d), ch, idx)
    out = QRE.sub(repl, out)
    print("injected", inj[0])
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
