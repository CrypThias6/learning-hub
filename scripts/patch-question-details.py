#!/usr/bin/env python3
"""Add grey detail text under every quiz question in the live JS bundle."""
from __future__ import annotations
import re, sys
from pathlib import Path

def js_esc(t):
    return t.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").replace("\r", " ")

def dec(t):
    try:
        return bytes(t, "utf-8").decode("unicode_escape")
    except Exception:
        return t

CAT = {
    "disciplines": "This is a horse sport or competition question. Read the named event or movement, then pick the matching meaning.",
    "anatomy": "This is a horse-body question. Picture that part on a living horse before you choose.",
    "care": "This is everyday horse care and welfare. Choose the safest, most complete habit.",
    "tack": "This is about saddlery or bits. Think what that piece of equipment is for and how it acts.",
    "breeds": "This asks what a named breed was developed for, or the trait it is most known for.",
    "rules": "This is arena manners or official competition rules. Think safety and what judges actually score.",
    "axe_throwing": "Use the named axe-throwing rule set (WATL or IATF). Those two leagues do not score every throw the same way.",
    "rugby": "This is rugby union unless the question clearly says league. Points, player numbers, and restarts are different.",
    "trucks_nz": "Use New Zealand truck words such as GVM, HPMV, licence classes, and trailer types.",
    "farm_animals": "This is NZ farm vocabulary or animal care. Match the correct animal name or husbandry idea.",
    "decks": "This is outdoor timber deck building in New Zealand, including treatment levels, joists, and barriers.",
    "turkey_country": "This is the country Turkiye / Turkey - geography, history, or culture - not the farm bird.",
    "nzac_ethics": "Use the NZAC Code of Ethics and NZ counselling membership rules, not overseas registration boards.",
    "te_tiriti_culture": "This is Te Tiriti o Waitangi and culturally safe helping practice in Aotearoa New Zealand.",
    "counselling_theories": "Name the approach, founder, or key idea. Keep CBT, person-centred, and systems ideas separate.",
    "counselling_skills": "This is a session skill such as listening, questioning, or contracting. Pick what that skill is for.",
    "supervision": "This is professional supervision for counsellors in New Zealand, including NZAC expectations.",
    "mental_health_basics": "This is a plain-language mental-health idea. Stay inside a counsellor role, not a doctor's.",
    "children_guidance_nz": "This is school guidance and work with children and young people in Aotearoa New Zealand.",
    "family_couples": "This is family or couples counselling. Think patterns between people, not only one person's traits.",
    "programme_nz_context": "This is counsellor education in New Zealand, especially Massey study and the NZ Qualifications Framework.",
}

SPEC = {
    "hq001": "Olympic riding includes more than one sport. This asks which competition puts those three phases together.",
    "hq002": "A piaffe is a named dressage movement. Think how the legs move and whether the horse travels forward.",
    "hq003": "A first jumping round is usually scored on faults before style. Time often only decides a later jump-off.",
    "hq004": "FEI is the international body that writes rules for many horse sports. Expand the letters.",
    "hq026": "The withers are the ridge between the shoulder blades. Height is measured there.",
    "hq028": "Look at the underside of the hoof. The frog is the softer V-shaped part.",
    "hq053": "Colic means belly pain in horses. Serious signs mean call a veterinarian.",
    "kq001": "WATL is the main league name in this style of axe throwing. Expand each letter.",
    "kq024": "Rugby union and rugby league do not start with the same number of players.",
    "kq025": "A try is grounding the ball in in-goal. Use the rugby union point value before any kick.",
    "kq047": "GVM is the maximum loaded weight allowed for that vehicle on its plate.",
    "kq117": "Turkey's capital is not its largest city. Name the political capital inland.",
    "kq118": "The biggest city sits on the Bosporus and is not the capital.",
    "mc001": "NZAC is the main professional association for counsellors in Aotearoa New Zealand. Expand the letters.",
    "mc002": "Counselling in NZ is largely self-regulated through a professional body, unlike doctors.",
    "mc041": "Carl Rogers founded a major humanistic school. Name that approach, not CBT.",
    "mc133": "The Massey PGDip is an academic diploma. Alone it is not a practising counsellor licence.",
}
