from flask import Flask, request, jsonify
from utils.stock_data import get_spy_data
import json
from datetime import datetime
import joblib
import pandas as pd
from pathlib import Path

app = Flask(__name__)

# load pretrained model
MODEL_PATH = Path(__file__).parent / "model" / "spy_tariff_lr.pkl"
model = joblib.load(MODEL_PATH)

# load events JSON
EVENTS_PATH = Path(__file__).parent / "data" / "tariff_events.json"
with open(EVENTS_PATH, encoding="utf-8") as f:
    tariff_events = json.load(f)
for ev in tariff_events:
    ev["date"] = pd.to_datetime(ev["date"])

# load SPY data
spy_df = pd.DataFrame(get_spy_data("2018-01-01", "2025-12-31"))
spy_df["Date"] = pd.to_datetime(spy_df["Date"])

def featurize(event_date):
    window = spy_df[
        (spy_df.Date < event_date) &
        (spy_df.Date >= event_date - pd.Timedelta(days=14))
    ]
    rets = window["Close"].pct_change().dropna()
    return [
        rets.mean(),
        rets.std(),
        window["Volume"].mean(),
    ]

@app.route("/api/predictions", methods=["GET"])
def get_predictions():
    results = []
    for ev in tariff_events:
        feats = featurize(ev["date"])
        prob_up = model.predict_proba([feats])[0,1]
        cls = int(prob_up >= 0.5)
        results.append({
            "date": ev["date"].strftime("%Y-%m-%d"),
            "prediction": cls,
            "probability_up": prob_up,
        })
    return jsonify(results)

@app.route("/api/spy", methods=["GET"])
def get_spy():
    start = request.args.get("start")
    end = request.args.get("end")

    # Optional: Validate dates
    try:
        datetime.strptime(start, "%Y-%m-%d")
        datetime.strptime(end, "%Y-%m-%d")
    except:
        return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400

    # Call function with matching parameter names
    data = get_spy_data(start, end)
    return jsonify(data)

@app.route("/api/events", methods=["GET"])
def get_tariff_events():
    with open("data/tariff_events.json", "r") as f:
        events = json.load(f)
    return jsonify(events)

print("Registered routes →", app.url_map)

if __name__ == "__main__":
    app.run(debug=True)