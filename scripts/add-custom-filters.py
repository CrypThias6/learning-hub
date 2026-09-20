#!/usr/bin/env python3
"""Add a Custom continent with practice filters to the live Pages bundle."""
from pathlib import Path
import sys

POP50 = [
    "IND", "CHN", "USA", "IDN", "PAK", "NGA", "BRA", "BGD", "RUS", "ETH",
    "MEX", "JPN", "EGY", "PHL", "COD", "VNM", "IRN", "TUR", "DEU", "THA",
    "GBR", "TZA", "FRA", "ZAF", "ITA", "KEN", "MMR", "COL", "KOR", "SDN",
    "UGA", "ESP", "DZA", "ARG", "IRQ", "AFG", "POL", "CAN", "MAR", "SAU",
    "UKR", "AGO", "UZB", "YEM", "PER", "MYS", "GHA", "MOZ", "NPL", "MDG",
]
AREA50 = [
    "RUS", "CAN", "CHN", "USA", "BRA", "AUS", "IND", "ARG", "KAZ", "DZA",
    "COD", "SAU", "MEX", "IDN", "SDN", "LBY", "IRN", "MNG", "PER", "TCD",
    "NER", "AGO", "MLI", "ZAF", "COL", "ETH", "BOL", "MRT", "EGY", "TZA",
    "NGA", "VEN", "NAM", "PAK", "MOZ", "TUR", "CHL", "ZMB", "MMR", "AFG",
    "SSD", "FRA", "SOM", "CAF", "UKR", "MDG", "BWA", "KEN", "YEM", "THA",
]
SMALL50 = [
    "VAT", "MCO", "NRU", "TUV", "SMR", "LIE", "MHL", "KNA", "MDV", "MLT",
    "GRD", "VCT", "BRB", "ATG", "SYC", "PLW", "AND", "LCA", "FSM", "SGP",
    "TON", "DMA", "BHR", "KIR", "STP", "MUS", "COM", "LUX", "WSM", "CPV",
    "TTO", "BRN", "CYP", "LBN", "JAM", "GMB", "QAT", "VUT", "MNE", "BHS",
    "SWZ", "DJI", "FJI", "KWT", "GNB", "ISR", "SLV", "SLB", "RWA", "MKD",
]
ISLANDS = [
    "AUS", "NZL", "PNG", "FJI", "SLB", "VUT", "KIR", "WSM", "TON", "TUV",
    "NRU", "MHL", "FSM", "PLW", "IDN", "PHL", "JPN", "LKA", "MDV", "SGP",
    "BRN", "TLS", "BHR", "CYP", "GBR", "IRL", "ISL", "MLT", "MDG", "COM",
    "MUS", "SYC", "CPV", "STP", "CUB", "JAM", "HTI", "DOM", "BHS", "BRB",
    "ATG", "DMA", "GRD", "KNA", "LCA", "VCT", "TTO",
]
LANDLOCKED = [
    "AFG", "AND", "ARM", "AUT", "AZE", "BDI", "BLR", "BTN", "BOL", "BWA",
    "BFA", "CAF", "TCD", "CZE", "SWZ", "ETH", "HUN", "KAZ", "KGZ", "LAO",
    "LSO", "LIE", "LUX", "MWI", "MLI", "MDA", "MNG", "NPL", "NER", "MKD",
    "PRY", "RWA", "SMR", "SRB", "SVK", "SSD", "CHE", "TJK", "TKM", "UGA",
    "UZB", "VAT", "ZMB", "ZWE",
]


def js_list(ids):
    return "[" + ",".join(f'"{x}"' for x in ids) + "]"


SECTIONS = (
    '{id:"custom",label:"Custom filters",parentId:null,sortOrder:60,unlockAfterId:null,mapColor:"#5B9CF5"},'
    '{id:"custom_pop50",label:"Top 50 by population",parentId:"custom",sortOrder:61,unlockAfterId:null,mapColor:"#5B9CF5"},'
    '{id:"custom_area50",label:"Top 50 by area",parentId:"custom",sortOrder:62,unlockAfterId:null,mapColor:"#4C8FE8"},'
    '{id:"custom_small50",label:"Smallest 50 by area",parentId:"custom",sortOrder:63,unlockAfterId:null,mapColor:"#7AA8F0"},'
    '{id:"custom_islands",label:"Island countries",parentId:"custom",sortOrder:64,unlockAfterId:null,mapColor:"#3DB8A8"},'
    '{id:"custom_landlocked",label:"Landlocked countries",parentId:"custom",sortOrder:65,unlockAfterId:null,mapColor:"#C4A35A"}'
)

OLD_S = (
    "function s(n){if('world'===n||'unlocked_world'===n)return t.countries;"
    "const o=c.get(n);return o?null===o.parentId?t.countries.filter(t=>t.parentSectionId===n||t.continent.toLowerCase().replace(/\\s+/g,'_')===n||t.sectionId===n||t.sectionId.startsWith(n+'_')):t.countries.filter(t=>t.sectionId===n):[]}"
)
NEW_S = (
    "function s(n){if('world'===n||'unlocked_world'===n)return t.countries;"
    f"const F={{custom_pop50:{js_list(POP50)},custom_area50:{js_list(AREA50)},"
    f"custom_small50:{js_list(SMALL50)},custom_islands:{js_list(ISLANDS)},"
    f"custom_landlocked:{js_list(LANDLOCKED)}}};"
    "if(F[n]){const ids=new Set(F[n]);return t.countries.filter(t=>ids.has(t.id))}"
    "if('custom'===n)return t.countries;"
    "const o=c.get(n);return o?null===o.parentId?t.countries.filter(t=>t.parentSectionId===n||t.continent.toLowerCase().replace(/\\s+/g,'_')===n||t.sectionId===n||t.sectionId.startsWith(n+'_')):t.countries.filter(t=>t.sectionId===n):[]}"
)

OLD_IF = (
    "if(S){const o=(0,m.getSection)(S),l='world'===S?'World \\u2014 everywhere':o?.label||S,"
    "u='world'===S?'All continents combined \\u2014 Capitals, Cities & Facts worldwide':'Pick a way to play';"
    "return(0,x.jsx)(f.SafeAreaView,{style:p.safe,edges:['top','bottom','left','right'],children:(0,x.jsxs)(t.default,{contentContainerStyle:p.scroll,children:[(0,x.jsxs)(c.default,{style:p.topRow,children:[(0,x.jsx)(s.default,{style:p.backChip,onPress:()=>k(null),children:(0,x.jsx)(n.default,{style:p.backChipText,children:\"\\u2190 Continents\"})})"
)
NEW_IF = (
    "if(S){if('custom'===S){const F=[{id:'custom_pop50',label:'Top 50 by population',hint:'Biggest countries by people'},"
    "{id:'custom_area50',label:'Top 50 by area',hint:'Biggest countries by land size'},"
    "{id:'custom_small50',label:'Smallest 50 by area',hint:'Tiny countries for extra practice'},"
    "{id:'custom_islands',label:'Island countries',hint:'Nations made of islands'},"
    "{id:'custom_landlocked',label:'Landlocked countries',hint:'No coastline \\u2014 inland map practice'}];"
    "return(0,x.jsx)(f.SafeAreaView,{style:p.safe,edges:['top','bottom','left','right'],children:(0,x.jsxs)(t.default,{contentContainerStyle:p.scroll,children:[(0,x.jsxs)(c.default,{style:p.topRow,children:[(0,x.jsx)(s.default,{style:p.backChip,onPress:()=>k(null),children:(0,x.jsx)(n.default,{style:p.backChipText,children:\"\\u2190 Continents\"})}),(0,x.jsx)(s.default,{style:p.gear,onPress:()=>e('settings'),children:(0,x.jsx)(n.default,{style:{fontSize:20},children:\"\\u2699\\ufe0f\"})})]}),(0,x.jsx)(n.default,{style:p.title,children:\"Custom\"}),(0,x.jsx)(n.default,{style:p.sub,children:\"Pick a filter for more specific practice\"}),(0,x.jsx)(c.default,{style:p.continentList,children:F.map(q=>(0,x.jsxs)(s.default,{style:p.continentBtn,onPress:()=>{w({sectionId:q.id}),k(q.id)},children:[(0,x.jsx)(c.default,{style:[p.dot,{backgroundColor:'#5B9CF5'}]}),(0,x.jsxs)(c.default,{style:{flex:1},children:[(0,x.jsx)(n.default,{style:p.continentName,children:q.label}),(0,x.jsx)(n.default,{style:p.worldHint,children:q.hint})]}),(0,x.jsx)(n.default,{style:p.chevron,children:\"\\u203a\"})]},q.id))})]})})}"
    "const o=(0,m.getSection)(S),l='world'===S?'World \\u2014 everywhere':o?.label||S,"
    "u='world'===S?'All continents combined \\u2014 Capitals, Cities & Facts worldwide':0===String(S).indexOf('custom_')?'This filter only \\u2014 Capitals, Cities & Facts':'Pick a way to play';"
    "return(0,x.jsx)(f.SafeAreaView,{style:p.safe,edges:['top','bottom','left','right'],children:(0,x.jsxs)(t.default,{contentContainerStyle:p.scroll,children:[(0,x.jsxs)(c.default,{style:p.topRow,children:[(0,x.jsx)(s.default,{style:p.backChip,onPress:()=>k(0===String(S).indexOf('custom_')?'custom':null),children:(0,x.jsx)(n.default,{style:p.backChipText,children:0===String(S).indexOf('custom_')?\"\\u2190 Filters\":\"\\u2190 Continents\"})})"
)

OLD_HINT = 't?(0,x.jsx)(n.default,{style:p.worldHint,children:"Every country & city in the game"}):null'
NEW_HINT = 't?(0,x.jsx)(n.default,{style:p.worldHint,children:"Every country & city in the game"}):\'custom\'===e?(0,x.jsx)(n.default,{style:p.worldHint,children:"Filters: population, area, islands, landlocked"}):null'


def patch(src: str) -> str:
    checks = []
    out = src

    def one(old, new, label):
        nonlocal out
        n = out.count(old)
        checks.append((label, n))
        print(("OK" if n == 1 else "WARN"), n, label)
        if n:
            out = out.replace(old, new)

    one(
        "const t=['world','oceania','asia','africa','europe','north_america','south_america']",
        "const t=['world','oceania','asia','africa','europe','north_america','south_america','custom']",
        "CONTINENT_ORDER",
    )
    one(
        "world:{latitude:10,longitude:20,latitudeDelta:120,longitudeDelta:160}}",
        "world:{latitude:10,longitude:20,latitudeDelta:120,longitudeDelta:160},"
        "custom:{latitude:10,longitude:20,latitudeDelta:120,longitudeDelta:160},"
        "custom_pop50:{latitude:10,longitude:20,latitudeDelta:120,longitudeDelta:160},"
        "custom_area50:{latitude:10,longitude:20,latitudeDelta:120,longitudeDelta:160},"
        "custom_small50:{latitude:10,longitude:20,latitudeDelta:120,longitudeDelta:160},"
        "custom_islands:{latitude:10,longitude:20,latitudeDelta:120,longitudeDelta:160},"
        "custom_landlocked:{latitude:10,longitude:20,latitudeDelta:120,longitudeDelta:160}}",
        "SECTION_BOUNDS",
    )
    one(
        '{id:"sa_south_cone",label:"Southern Cone",parentId:"south_america",sortOrder:53,unlockAfterId:"north_america",mapColor:"#8B5FC0"}],countries:',
        '{id:"sa_south_cone",label:"Southern Cone",parentId:"south_america",sortOrder:53,unlockAfterId:"north_america",mapColor:"#8B5FC0"},'
        + SECTIONS
        + "],countries:",
        "sections",
    )
    one(OLD_S, NEW_S, "countriesInSection")
    one(OLD_IF, NEW_IF, "HomeScreen custom UI")
    one(OLD_HINT, NEW_HINT, "custom hint")
    bad = [label for label, n in checks if n != 1]
    if bad:
        print("FAILED replacements:", bad)
        return src
    return out


def main():
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/lh-pages/_expo/static/js/web/index-e692932e42ea2ff98944c1bb62b893a7.js")
    src = path.read_text(encoding="utf-8", errors="ignore")
    out = patch(src)
    if out == src:
        print("no changes written")
        return 1
    path.write_text(out, encoding="utf-8")
    print("wrote", path, path.stat().st_size)
    print("custom_pop50", out.count("custom_pop50"))
    print("Custom filters", out.count("Custom filters"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
