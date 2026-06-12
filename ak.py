from flask import Flask, jsonify, render_template, request
from openai import OpenAI

client = OpenAI(
    api_key="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"
)
app = Flask(__name__)
chemicals_db = {
    "benzene": {
        "formula": "C6H6",
        "ld50_oral": 930,
        "environmental_persistence": "Moderate",
        "description": "A volatile organic compound, carcinogenic and polluting.",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    "mercury": {
        "formula": "Hg",
        "ld50_oral": 1,
        "environmental_persistence": "High",
        "description": "Highly toxic heavy metal, bioaccumulates in ecosystems.",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    "aspirin": {
        "formula": "C9H8O4",
        "ld50_oral": 200,
        "environmental_persistence": "Low",
        "description": "Common drug, low environmental impact.",
        "image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    "lead": {
        "formula": "Pb",
        "ld50_oral": 30,
        "environmental_persistence": "Very High",
        "description": "Toxic heavy metal used in paints and batteries.",
        "image": "https://th.bing.com/th/id/OIP.J7P_HNW9CTYXnX9E8lWnNQHaE8?w=273&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
    },
    "arsenic": {
        "formula": "As",
        "ld50_oral": 15,
        "environmental_persistence": "High",
        "description": "A highly toxic metalloid commonly found in contaminated groundwater.",
        "image": "https://media.sciencephoto.com/image/c0047003/800wm/C0047003-Arsenic.jpg",
    },
    "ammonia": {
        "formula": "NH3",
        "ld50_oral": 350,
        "environmental_persistence": "Low",
        "description": "Agricultural pollutant mainly from fertilizers.",
        "image": "https://5.imimg.com/data5/WHATSAPP/Default/2023/12/370967662/YE/JD/NG/187662292/new-product-1000x1000.jpeg",
    },
    "chlorine": {
        "formula": "Cl2",
        "ld50_oral": 400,
        "environmental_persistence": "Moderate",
        "description": "Used in sanitation; toxic at high concentrations.",
        "image": "https://th.bing.com/th/id/OIP.Akb3t9QIw3ON_cVr7xQm5gHaE8",
    },
    "cyanide": {
        "formula": "CN-",
        "ld50_oral": 2,
        "environmental_persistence": "Low",
        "description": "Extremely toxic compound affecting the respiratory system.",
        "image": "https://th.bing.com/th/id/OIP.0c-Gcx6V-MB9jptYj5x1OAHaD_",
    },
    "ethanol": {
        "formula": "C2H5OH",
        "ld50_oral": 7000,
        "environmental_persistence": "Low",
        "description": "Low toxicity organic solvent.",
        "image": "https://th.bing.com/th/id/OIP.A3PXIu5gqE5KKh824d16oQHaE8",
    },
    "carbon monoxide": {
        "formula": "CO",
        "ld50_oral": 0,
        "environmental_persistence": "Moderate",
        "description": "Highly toxic gas that prevents oxygen transport in blood.",
        "image": "https://th.bing.com/th/id/OIP.DpwtYooE9j7C0wO6zMS6pQHaHa",
    },
    "formaldehyde": {
        "formula": "CH2O",
        "ld50_oral": 100,
        "environmental_persistence": "Low",
        "description": "Used in disinfectants and preserving biological specimens. Known carcinogen.",
        "image": "https://tse4.mm.bing.net/th/id/OIP.PxPIoe48pehbwiPhNGCsAwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    "sodium hydroxide": {
        "formula": "NaOH",
        "ld50_oral": 500,
        "environmental_persistence": "Low",
        "description": "Caustic soda used in soap manufacturing and drain cleaners. Corrosive to tissues.",
        "image": "https://images.unsplash.com/photo-1583468323330-9032ad490fed?w=400",
    },
    "acetone": {
        "formula": "C3H6O",
        "ld50_oral": 5800,
        "environmental_persistence": "Low",
        "description": "Common solvent found in nail polish remover. Highly flammable.",
        "image": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400",
    },
    "hydrogen peroxide": {
        "formula": "H2O2",
        "ld50_oral": 2000,
        "environmental_persistence": "Low",
        "description": "Used as disinfectant and bleaching agent. Decomposes to water and oxygen.",
        "image": "https://tse2.mm.bing.net/th/id/OIP.btqbbegePIOnentOux6imAHaI-?rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    "sodium chloride": {
        "formula": "NaCl",
        "ld50_oral": 3000,
        "environmental_persistence": "Low",
        "description": "Common table salt. Essential for life but toxic in high amounts.",
        "image": "https://tse4.mm.bing.net/th/id/OIP.bYGT_2eYAqmoqdlmBH1rkAHaFj?rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    "caffeine": {
        "formula": "C8H10N4O2",
        "ld50_oral": 192,
        "environmental_persistence": "Low",
        "description": "Stimulant found in coffee and energy drinks. Toxic in high doses.",
        "image": "https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?cs=srgb&dl=pexels-igor-haritanovich-814387-1695052.jpg&fm=jpg",
    },
    "pesticide-chlorpyrifos": {
        "formula": "C9H11Cl3NOPS",
        "ld50_oral": 163,
        "environmental_persistence": "Moderate",
        "description": "Organophosphate insecticide linked to neurological damage. Banned in many countries.",
        "image": "https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=400",
    },
    "dichloromethane": {
        "formula": "CH2Cl2",
        "ld50_oral": 1600,
        "environmental_persistence": "Moderate",
        "description": "Industrial solvent used in paint stripping. Suspected carcinogen.",
        "image": "https://th.bing.com/th/id/OIP.qJjz2ccOMuKdaE28dFeWsgHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    "toluene": {
        "formula": "C7H8",
        "ld50_oral": 636,
        "environmental_persistence": "Moderate",
        "description": "Aromatic solvent used in paints and adhesives. Neurotoxic effects.",
        "image": "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=400",
    },
    "sulfuric acid": {
        "formula": "H2SO4",
        "ld50_oral": 2140,
        "environmental_persistence": "Low",
        "description": "Highly corrosive acid used in batteries and fertilizers.",
        "image": "https://th.bing.com/th/id/OIP.PLz48bSA2xRxLCNNzXQdJgHaHa?w=188&h=188&c=7&r=0&o=7&pid=1.7&rm=3",
    },
    "nicotine": {
        "formula": "C10H14N2",
        "ld50_oral": 6,
        "environmental_persistence": "Low",
        "description": "Highly addictive stimulant in tobacco. Toxic in pure form.",
        "image": "https://th.bing.com/th/id/OIP.Zr0X0qpJAHrnoBdjo5M7IgHaE0?w=273&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
    },
}


def analyze_chemical(chemical_name):
    chem = chemical_name.strip().lower()
    if chem not in chemicals_db:
        return {"success": False, "message": "Chemical not found."}
    data = chemicals_db[chem].copy()
    ld50 = data["ld50_oral"]
    # Risk assessment
    if ld50 < 50:
        risk = "High Toxicity"
    elif ld50 < 500:
        risk = "Moderate Toxicity"
    else:
        risk = "Low Toxicity"
    data["risk_assessment"] = risk
    # For charts: assign toxicity, safety, hazard values
    data["toxicity"] = round(1000 / (ld50 + 1), 2)
    # Higher LD50 = safer. Scale: LD50 directly maps to safety (0-1000 range)
    data["safety"] = min(1000, ld50) if ld50 > 0 else 0
    data["hazard"] = 1000 - data["safety"]
    # lower LD50 = more hazard
    # risk breakdown (for pie chart)
    if risk == "High Toxicity":
        data["risk"] = {"low": 10, "medium": 20, "high": 70}
    elif risk == "Moderate Toxicity":
        data["risk"] = {"low": 30, "medium": 50, "high": 20}
    else:
        data["risk"] = {"low": 70, "medium": 20, "high": 10}
    return {"success": True, "data": data}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chemicals")
def chemical_list():
    return jsonify(list(chemicals_db.keys()))


@app.route("/analyze", methods=["POST"])
def analyze():
    chemical = request.json.get("chemical", "").lower()
    return jsonify(analyze_chemical(chemical))


@app.route("/all_data")
def all_data():
    """Send full chemical dataset for global graphs."""
    all_data_list = []
    for name, chem in chemicals_db.items():
        ld50 = chem["ld50_oral"]
        safety = max(0, 1000 - ld50)
        hazard = 1000 - safety
        all_data_list.append(
            {
                "name": name,
                "formula": chem.get("formula", ""),
                "description": chem.get("description", ""),
                "image": chem.get("image", ""),
                "ld50_oral": ld50,
                "toxicity": round(1000 / (ld50 + 1), 2),
                "safety": safety,
                "hazard": hazard,
            }
        )
    return jsonify(all_data_list)


aliases = {
    "h2o": "water",
    "water": "ammonia",  # (you don't have water, so map if needed)
    "leed": "lead",
    "pb": "lead",
    "hg": "mercury",
    "co": "carbon monoxide",
    "alcohol": "ethanol",
    "cyanid": "cyanide",
}


def build_chemical_context():
    """Build a context string with all chemical data for AI prompts."""
    context = "Available chemicals:\n"
    for name, data in chemicals_db.items():
        risk = (
            "High"
            if data["ld50_oral"] < 50
            else "Moderate"
            if data["ld50_oral"] < 500
            else "Low"
        )
        context += f"- {name.capitalize()}: Formula={data['formula']}, LD50={data['ld50_oral']} mg/kg, Toxicity={risk}, Persistence={data['environmental_persistence']}\n"
    return context


@app.route("/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("message", "").lower().strip()

    if not user_msg:
        return jsonify({"reply": "Please enter a message."})

    words = user_msg.split()
    normalized_words = []

    for word in words:
        if word in aliases:
            normalized_words.append(aliases[word])
        else:
            normalized_words.append(word)

    user_msg = " ".join(normalized_words)

    import difflib

    found = []
    for word in user_msg.split():
        match = difflib.get_close_matches(word, chemicals_db.keys(), n=1, cutoff=0.7)
        if match:
            found.append(match[0])

    if ("more toxic" in user_msg or "less toxic" in user_msg) and len(found) >= 2:
        c1, c2 = found[0], found[1]
        ld1 = chemicals_db[c1]["ld50_oral"]
        ld2 = chemicals_db[c2]["ld50_oral"]

        more = c1 if ld1 < ld2 else c2
        less = c2 if more == c1 else c1

        return jsonify(
            {"reply": f"{more.capitalize()} is more toxic than {less} (lower LD50)."}
        )

    if "safer" in user_msg and len(found) >= 2:
        c1, c2 = found[0], found[1]
        ld1 = chemicals_db[c1]["ld50_oral"]
        ld2 = chemicals_db[c2]["ld50_oral"]

        safer = c1 if ld1 > ld2 else c2

        return jsonify({"reply": f"{safer.capitalize()} is safer (higher LD50)."})

    if found:
        chem = found[0]
        data = chemicals_db[chem]

        return jsonify(
            {
                "reply": f"{chem.capitalize()} ({data['formula']}): {data['description']} (LD50: {data['ld50_oral']} mg/kg)"
            }
        )
    if "rank" in user_msg or "most toxic" in user_msg:
        sorted_chems = sorted(chemicals_db.items(), key=lambda x: x[1]["ld50_oral"])
        names = [c[0].capitalize() for c in sorted_chems]

        return jsonify({"reply": "Most to least toxic:\n" + " > ".join(names)})

    return jsonify({"reply": "Ask about toxicity, safety, or compare chemicals."})


import difflib


def fuzzy_match(word):
    if not isinstance(word, str):  # ✅ Fix None issue
        return None

    matches = difflib.get_close_matches(
        word,
        list(chemicals_db.keys()),  # ✅ Fix dict_keys issue
        n=1,
        cutoff=0.7,
    )
    return matches[0] if matches else None


@app.route("/compare", methods=["POST"])
def compare():
    chem1_input = request.json.get("chem1", "").lower().strip()
    chem2_input = request.json.get("chem2", "").lower().strip()

    chem1_input = aliases.get(chem1_input, chem1_input)
    chem2_input = aliases.get(chem2_input, chem2_input)

    chem1 = fuzzy_match(chem1_input)
    chem2 = fuzzy_match(chem2_input)

    if not chem1 or not chem2:
        return jsonify({"success": False, "message": "Invalid chemical name(s)"})

    data1 = analyze_chemical(chem1)["data"]
    data2 = analyze_chemical(chem2)["data"]

    if data1["ld50_oral"] < data2["ld50_oral"]:
        more_toxic = chem1
        safer = chem2
    else:
        more_toxic = chem2
        safer = chem1
    return jsonify(
        {
            "success": True,
            "chem1": data1,
            "chem2": data2,
            "summary": f"{chem1.capitalize()} vs {chem2.capitalize()}\n\nMore toxic: {more_toxic.capitalize()}\nSafer: {safer.capitalize()}",
        }
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
