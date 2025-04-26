import React, { useState, useEffect } from "react";
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
    const [startDate, setStartDate] = useState("2018-01-01");
    const [endDate, setEndDate] = useState("2025-12-31");

    const fetchData = async () => {
        try {
            const res = await axios.get(`/api/spy`, {
                params: { start: startDate, end: endDate }
            });
            console.log("fetched SPY:", res.data);
            setData(res.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("/api/spy", {
                    params: { start: startDate, end: endDate }
                });
                console.log("fetched SPY:", res.data);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
                📈 SPY Tariff Impact Analyzer{data.length === 0 && <p>Loading… or no data</p>}
            </h2>
            <div className="mb-4">
                <label>
                    Start Date: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </label>
                <label>
                    End Date: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </label>
                <button onClick={fetchData} className="ml-4 px-3 py-1 bg-blue-600 text-white rounded">
                    Fetch Data
                </button>
            </div>

            {data.length === 0 ? (
                <p>Loading or no data available for this range.</p>
            ) : (
            <LineChart width={800} height={400} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date" tickFormatter={date => date.slice(5)} />
                <YAxis 
                    domain={[dataMin => dataMin * 0.975, dataMax => dataMax * 1.025]}
                    label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={value => `$${value.toFixed(2)}`}
                />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`}/>
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="Close" 
                    dot={false} 
                    name="SPY Close" 
                />

                {tariffEvents.map((event, index) => {
                    const point = data.find(d => d.Date === event.date);
                    return (
                        <ReferenceDot
                        key={index}
                        x={event.date}
                        y={point ? point.Close : 0}
                        r={5}
                        stroke="red"
                        strokeWidth={2}
                        >
                        <Label value={event.label} position="top" offset={10} />
                        </ReferenceDot>
                    );
                })}
            </LineChart>
            )}
        </div>
    );
}