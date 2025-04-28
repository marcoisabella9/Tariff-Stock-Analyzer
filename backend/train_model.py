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
spy_records = get_spy_data("2018-01-01", "2025-12-31")
spy = pd.DataFrame(spy_records)
spy["Date"] = pd.to_datetime(spy["Date"])

# Feature engineering
def extract_features(event_date):
    # features from 14 days before the event
    window = spy[
        (spy.Date < event_date) &
        (spy.Date >= event_date - pd.Timedelta(days=14))
    ]
    rets = window["Close"].pct_change().dropna()
    return {
        "pre2w_mean_ret": rets.mean(),
        "pre2w_vol": rets.std(),
        "pre2w_vol_avg": window["Volume"].mean(),
    }

# --- replace your compute_label() with this ---
def compute_label_short(event_date, horizon=1):
    # find the integer index of the event date in 'spy'
    idxs = spy.index[spy.Date == event_date].tolist()
    if not idxs:
        return None
    idx = idxs[0]
    target_idx = idx + horizon
    if target_idx >= len(spy):
        return None

    today_close  = spy.iloc[idx].Close
    future_close = spy.iloc[target_idx].Close
    return 1 if (future_close > today_close) else 0

# build dataframe of examples
rows = []
for ev in tariff_events:
    feats = extract_features(ev["date"])
    label = compute_label_short(ev["date"], horizon=3) 
    if label is None:
        continue
    feats["label"] = label
    rows.append(feats)

df = pd.DataFrame(rows)

# Define X and y for training
X = df[["pre2w_mean_ret", "pre2w_vol", "pre2w_vol_avg"]]
y = df["label"]

print("Feature matrix shape:", X.shape)
print("Positive labels:", y.sum(), " / ", len(y))

model = LogisticRegression(max_iter=1000)
model.fit(X, y)

models_dir = Path(__file__).parent / "model"
models_dir.mkdir(exist_ok=True)
models_path = models_dir / "spy_tariff_lr.pkl"

joblib.dump(model, "model/spy_tariff_lr.pkl")
# Save the model to a file
print(f"Model saved to {models_path}")