from flask import Flask, request, jsonify
from utils.stock_data import get_spy_data
import json
from datetime import datetime

app = Flask(__name__)


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

if __name__ == "__main__":
    app.run(debug=True)