#!/usr/bin/env python3
"""Build English image-generation prompts from product list JSON."""
import sys
import json
import re

if len(sys.argv) < 2:
    print("Usage: build-prompts.py <products.json>", file=sys.stderr)
    sys.exit(1)

with open(sys.argv[1], "r", encoding="utf-8") as f:
    d = json.load(f)

for p in d.get("data", []):
    sku = p["sku"]
    slug = re.sub(r"[^a-z0-9]+", "-", sku.lower()).strip("-")
    name = p["name"]
    tipe = p["tipe"]

    # Translate Indonesian product name to English prompt
    en = name
    en = re.sub(r"Kampas Rem (Belakang|Depan)", r"motorcycle \1 brake pad", en, flags=re.I)
    en = re.sub(r"Kampas Rem", "motorcycle brake pad", en, flags=re.I)
    en = re.sub(r"Kampas", "brake pad", en, flags=re.I)
    en = re.sub(r"Oli Mesin", "engine oil bottle", en, flags=re.I)
    en = re.sub(r"Ban (\S+) (\S+-\S+) (Depan|Belakang)", r"motorcycle \3 tire \2", en, flags=re.I)
    en = re.sub(r"Ban", "motorcycle tire", en, flags=re.I)
    en = re.sub(r"Aki Kering", "maintenance-free motorcycle battery", en, flags=re.I)
    en = re.sub(r"Aki Basah", "conventional motorcycle battery", en, flags=re.I)
    en = re.sub(r"Aki", "motorcycle battery", en, flags=re.I)
    en = re.sub(r"Bohlam Depan LED (H\d+)", r"motorcycle LED headlight bulb \1", en, flags=re.I)
    en = re.sub(r"Bohlam Stop Lamp", "motorcycle brake light bulb", en, flags=re.I)
    en = re.sub(r"Bohlam", "light bulb", en, flags=re.I)
    en = re.sub(r"Roller CVT (\d+g)", r"motorcycle CVT roller weights \1 set of 6", en, flags=re.I)
    en = re.sub(r"Roller CVT", "motorcycle CVT roller weights set of 6", en, flags=re.I)
    en = re.sub(r"V-Belt", "motorcycle V-belt drive belt", en, flags=re.I)
    en = re.sub(r"Set Rantai Gear", "motorcycle chain and sprocket set", en, flags=re.I)
    en = re.sub(r"Shock Belakang", "motorcycle rear shock absorber", en, flags=re.I)
    en = re.sub(r"Shock", "motorcycle shock absorber", en, flags=re.I)
    en = re.sub(r"Busi", "motorcycle spark plug", en, flags=re.I)
    en = re.sub(r"Filter Udara", "motorcycle air filter", en, flags=re.I)
    en = re.sub(r"Filter Oli", "motorcycle oil filter", en, flags=re.I)
    en = re.sub(r"Filter", "motorcycle filter", en, flags=re.I)
    en = re.sub(r"Kabel Gas", "motorcycle throttle cable", en, flags=re.I)
    en = re.sub(r"Kabel Kopling", "motorcycle clutch cable", en, flags=re.I)
    en = re.sub(r"Kabel", "motorcycle cable", en, flags=re.I)
    en = re.sub(r"Spion Set", "motorcycle mirror set", en, flags=re.I)
    en = re.sub(r"Spion (Kanan|Kiri)", r"motorcycle \1 mirror", en, flags=re.I)
    en = re.sub(r"Spion", "motorcycle mirror", en, flags=re.I)

    tipe_desc = "aftermarket part"
    if tipe == "ORI":
        tipe_desc = "original genuine part in retail box"
    elif tipe == "OEM":
        tipe_desc = "OEM aftermarket part"

    prompt = f"single {en}, {tipe_desc}, professional product photography, white background, e-commerce style, no text"
    print(f"{sku}|{slug}|{prompt}")
