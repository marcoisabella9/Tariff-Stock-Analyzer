// File: frontend/src/components/SpyChart.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import tariffEvents from "../data/tariffEvents";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  Label
} from "recharts";

export default function SpyChart() {
  const [data, setData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [startDate, setStartDate] = useState("2018-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch SPY OHLCV data
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("/api/spy", {
        params: { start: startDate, end: endDate }
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching SPY data:", err);
    }
  }, [startDate, endDate]);

  // Fetch model predictions for each event
  const fetchPredictions = useCallback(async () => {
    try {
      const res = await axios.get("/api/predictions");
      setPredictions(res.data);
    } catch (err) {
      console.error("Error fetching predictions:", err);
    }
  }, []);

  // Run both on-mount and whenever dates change
  useEffect(() => {
    fetchData();
    fetchPredictions();
  }, [fetchData, fetchPredictions]);

  // Snap an event’s date to the nearest prior trading day
  const getPointForEvent = useCallback(
    (eventDate) => {
      let point = data.find((d) => d.Date === eventDate);
      if (!point) {
        const sorted = [...data].sort(
          (a, b) => new Date(a.Date) - new Date(b.Date)
        );
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (new Date(sorted[i].Date) < new Date(eventDate)) {
            point = sorted[i];
            break;
          }
        }
      }
      return point; // returns the full record (with .Date, .Close, etc.)
    },
    [data]
  );

  // Find the model’s prediction object for a given date
  const findPrediction = (date) =>
    predictions.find((p) => p.date === date) || {
      probability_up: null,
      prediction: null
    };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📈 SPY Tariff Impact Analyzer</h2>

      {/* Date range selectors */}
      <div className="mb-4">
        <label>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            min="2018-01-01"
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="ml-4">
          End Date:{" "}
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={today}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button
          onClick={fetchData}
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Fetch Data
        </button>
      </div>

      {/* Chart or loading message */}
      {data.length === 0 ? (
        <p>Loading or no data available for this range.</p>
      ) : (
        <LineChart width={800} height={400} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" type="category" tickFormatter={(d) => d.slice(5)} />
          <YAxis
            domain={[(min) => min * 0.95, (max) => max * 1.05]}
            label={{ value: "Price (USD)", angle: -90, position: "insideLeft" }}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
          <Legend />
          <Line type="monotone" dataKey="Close" stroke="#8884d8" dot={false} />

          {/* Event markers with model predictions */}
          {tariffEvents.map((event, idx) => {
            const point = getPointForEvent(event.date);
            if (!point) return null;

            const { probability_up, prediction } = findPrediction(event.date);
            const pctLabel =
              probability_up != null
                ? `${(probability_up * 100).toFixed(0)}%${prediction ? "↑" : "↓"}`
                : "";
            const strokeColor = prediction === 1 ? "green" : "red";

            return (
              <ReferenceDot
                key={idx}
                x={point.Date}
                y={point.Close}
                r={6}
                stroke={strokeColor}
                strokeWidth={2}
                cursor="pointer"
                onClick={() =>
                  setSelectedEvent({ ...event, ...findPrediction(event.date) })
                }
              >
                <Label value={`${event.label} ${pctLabel}`} position="top" offset={10} />
              </ReferenceDot>
            );
          })}
        </LineChart>
      )}

      {/* Event detail panel */}
      {selectedEvent && (
        <div className="mt-6 p-4 border rounded bg-white shadow">
          <h3>
            {selectedEvent.label} — {selectedEvent.date}
          </h3>
          <p>{selectedEvent.description}</p>
          {selectedEvent.probability_up != null && (
            <p>
              Model predicts:{" "}
              <strong>{selectedEvent.probability_up >= 0.5 ? "Up" : "Down"}</strong>{" "}
              ({(selectedEvent.probability_up * 100).toFixed(1)}%)
            </p>
          )}
          <button
            onClick={() => setSelectedEvent(null)}
            className="mt-2 px-2 py-1 bg-gray-300 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
