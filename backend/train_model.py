import json
from pathlib import Path

events_path = Path(__file__).parent / "data" / "tariff_events.json"
with open(events_path, encoding="utf-8") as f:
    tariff_events = json.load(f)
# tariff_events is now a list of dicts

import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression

# load tariff events JSON
events_path = Path(__file__).parent / "data" / "tariff_events.json"
with open(events_path, encoding="utf-8") as f:
    tariff_events = json.load(f)
for ev in tariff_events:
    ev["date"] = pd.to_datetime(ev["date"])

# load spy price data
from utils.stock_data import get_spy_data

# turn list of dicts into a DataFrame
spy_records = get_spy_data
# model here ran out of time lol

model = LogisticRegression(max_iter=1000)
model.fit(X, y)

joblib.dump(model, "model/spy_tariff_lr.pkl")
# Save the model to a file