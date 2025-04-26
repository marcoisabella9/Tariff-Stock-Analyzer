<h1>Tariff Impact Analyzer</h1>

<h2>Description</h2>
<p><strong>Objective:</strong> Build a web application that visualizes how broad market ETFs (e.g., SPY) reacted to major tariff announcements, overlaying stock price time series with annotated tariff events. 
include model details here</p>

<h2>Significance</h2>
<p><strong>Significance:</strong> Provides investors and researchers an interactive tool to correlate macroeconomic policy changes with market behavior. Novel in combining policy event timelines with ETF performance in a single, explorable interface.</p>

<h2>Instructions for Web Usage</h2>
<ol>
  <li><strong>Clone the repository</strong></li>
  <li><strong>Start the backend (Flask):</strong>
    <pre><code>cd backend
pip install -r requirements.txt
python app.py
</code></pre>
  </li>
  <li><strong>Start the frontend (React):</strong>
    <pre><code>cd frontend
npm install
npm start
</code></pre>
  </li>
  <li><strong>Navigate</strong> to <code>http://localhost:3000</code></li>
  <li><strong>Select</strong> a date range and click <em>Fetch Data</em> to view SPY’s performance with tariff event markers.</li>
</ol>

<h2>Code Structure</h2>
<pre><code>Tariff-Analyzer/
├── backend/
│   ├── app.py             # Flask API endpoints for /api/spy and /api/events
│   └── utils/
│       └── stock_data.py  # SPY data download and formatting
├── data/
│   └── tariff_events.json # List of tariff events with dates, labels, descriptions
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── SpyChart.jsx # React chart component
│   │   ├── data/
│   │   │   └── tariffEvents.js
│   │   └── App.jsx         # Main React app boilerplate
│   └── package.json
└── README.md
</code></pre>

<h2>Functionalities and Test Results</h2>
<ul>
  <li><strong>Fetch SPY Data</strong>
    <ul>
      <li><em>Function:</em> Calls <code>/api/spy?start=YYYY-MM-DD&amp;end=YYYY-MM-DD</code></li>
      <li><em>Test:</em> Returns JSON array of daily market info</li>
    </ul>
  </li>
  <li><strong>Fetch Tariff Events</strong>
    <ul>
      <li><em>Function:</em> Calls <code>/api/events</code></li>
      <li><em>Test:</em> Returns JSON list of events</li>
    </ul>
  </li>
  <li><strong>Interactive Chart</strong>
    <ul>
      <li><em>Function:</em> Plots SPY closing prices and event markers</li>
      <li><em>Test:</em> Markers appear on nearest trading days; clicking shows descriptions</li>
    </ul>
  </li>
  <li><strong>Date Range Validation</strong>
    <ul>
      <li><em>Function:</em> Prevents selection before 2018-01-01 and after today</li>
      <li><em>Test:</em> Calendar picker disables out-of-range dates</li>
    </ul>
  </li>
</ul>

<h2>Data Collection</h2>
<ul>
  <li><strong>Source:</strong> Yahoo Finance via <code>yfinance</code></li>
  <li><strong>Ticker:</strong> SPY (S&amp;P 500 ETF)</li>
  <li><strong>Date Range:</strong> 2018-01-01 through present (~1,840 trading days)</li>
  <li><strong>Fields:</strong> Date, Open, High, Low, Close, Volume</li>
</ul>

<h2>Data Processing</h2>
<ul>
  <li><strong>Reset Index:</strong> Convert Date index to column</li>
  <li><strong>Date Formatting:</strong> Stringify to <code>YYYY-MM-DD</code></li>
  <li><strong>Column Selection:</strong> Keep only OHLCV</li>
</ul>

<h2>Model Development</h2>
<p><em>To be completed</em></p>

<h2>Discussion and Conclusions</h2>
<p><em>To be completed</em></p>
