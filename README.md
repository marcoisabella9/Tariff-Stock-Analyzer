<h1>Tariff Impact Analyzer</h1>

<h2>Description</h2>
<p><strong>Objective:</strong> We built a web application that visualizes how broad market ETFs (e.g., SPY) reacted to major tariff announcements, overlaying stock price time series with annotated tariff events. Users can read descriptions and see our model predictions on each "tariff event" by clicking the nodes on the graph, and alter the start and end dates to view how tariffs affect the US economy.
<br><strong>Model Details:</strong> We implemented a logistic regression classifier to predict the following 3-day period (alterable) direction of SPY following each tariff announcement, using three features computed over the 14 trading days immediately before the event:  
<ul>
  <li><em>pre2w_mean_ret</em>: average daily return</li>
  <li><em>pre2w_vol</em>: return volatility</li>
  <li><em>pre2w_vol_avg</em>: average trading volume</li>
</ul>
The model was trained on 17 historical tariff events (9 positive next-day returns, 8 negative) and serialized for use in the Flask API.</p>

<h2>Significance</h2>
<p>Our tool can serve to provide investors and researchers an interactive tool to correlate macroeconomic policy changes based on market behavior. Our tool is novel in combining policy event timelines with ETF performance in a single, explorable interface.</p>

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
│   ├── app.py                   # Flask API endpoints for /api/spy, /api/events, /api/predictions
│   ├── train_model.py           # Script to train & serialize the logistic regression model
│   ├── model/
│   │   └── spy_tariff_lr.pkl    # Trained logistic regression model
│   └── utils/
│       └── stock_data.py        # SPY data download and formatting
├── data/
│   └── tariff_events.json       # List of tariff events with dates, labels, descriptions
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── SpyChart.jsx     # React chart component (fetches /api/predictions)
│   │   ├── data/
│   │   │   └── tariffEvents.js
│   │   └── App.jsx             # Main React app boilerplate
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
  <li><strong>Fetch Model Predictions</strong>
    <ul>
      <li><em>Function:</em> Calls <code>/api/predictions</code></li>
      <li><em>Test:</em> Returns JSON list of {date, prediction, probability_up}</li>
    </ul>
  </li>
  <li><strong>Interactive Chart</strong>
    <ul>
      <li><em>Function:</em> Plots SPY closing prices, event markers, and colors/labels by prediction</li>
      <li><em>Test:</em> Markers show “Up”/“Down” probabilities and clicking shows full details</li>
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
We used Yahoo Finance to collect our data via the <code>yfinance</code> library. We focused particularly on the SPY S&P500 ETF as we believe this can be used as a general indicator of market health and volatility. 
Our model takes into account trading days spanning from 1/1/2018 through the present, which is over 1,800 days. These days include the data points OHLCV (Date, Open, High, Low, Close, and Volume).

<h2>Data Processing</h2>
The raw DataFrame sometimes comes with a Pandas MultiIndex on columns. We flattened it by taking only the first level (e.g. “Open” instead of (“Open”,””)), then called <code>reset_index()</code> so that the date moves from the DataFrame index into its own Date column. We also converted the Date column into a standardized string format to simplify JSON serialization and make sure the comparisons would be consistent when matching the tariff event dates.
We also had to make sure that for each tariff event we can find the nearest trading day, as some events did not occur on valid trading days. For example, on the weekend or federal holidays. For these we had to locate the closest previous valid trading day in the SPY dataset.

<h2>Model Development</h2>
<p><strong>Algorithm:</strong> Logistic Regression classification</p>
We selected <code>sklearn.linear_model.LogisticRegression</code> for binary classification on prediction in whehter SPY's return is up or down in the 3 days following a tariff event. In terms of Feature Engineering, for each event we take into account the previous 14 days of trading data and find three features. <code>pre2w_mean_ret</code> is the mean of daily percentage changes in the market close of the day. <code>pre2w_vol</code> is the standard deviation of those daily percent changes, finding the volatility. <code>pre2w_vol_avg</code> is the average daily trading volume over that 2 week period, showing market interest. Our target label is whether or not the next 3 days return will be positive or negative. Focusing on this short-period of time allows us to see the immediate reaction of the market and avoid the inevitable long term upward bias. For training we use our same 17 tariff event set. 9 of these had next-day upward movement and 8 had downward movement. This balance in the dataset helps our model learn both positive and negative cases effectively. We fit the logistic regression with L2 regularization with 1000 max iterations to ensure convergence. The model shows 65% average accuracy, 0.62 ROC-AUC, which indicates a modest ability to determine up and downard moves which is acceptable in this case.

<h2>Discussion and Conclusions</h2>
Our tool allows users to not only see tariff events plotted against a dynamic plot of what is essentially the health of the stock market, but also compare the data to the predictions of our model. This provides insight into how tariffs in general affect the stock market both in the short and long term. Our model doesn't boast the highest stats when it comes to accuracy, but in this context it is more than acceptable. We are looking at major tariff events in the United States alone, leading to a pretty small sample size which restricts the model's potential accuracy. To increase the sample size we could potentially increase the length of time further back than 2018 and analyze the tariffs going all the way back through US history. Looking at the results however isn't far from what one would expect. Tariff events unanimously predict downturns in short term market health. This is because these events cause uncertainty in the US economy, which investors in large scale ETF's hate. However if we were to increase our view as little as to 2 weeks (which can be changed in <code>train_model.py</code>) our predictions change to positive. This is because the ETF market has always recovered from uncertainty in the long run. The same can be said about the amount of time we take into account before the tariff event (which can also be changed in <code>train_model.py</code>). My experiences within this course allowed me to be able to take a real world current event and reinforce my understanding of it with a predictive model that allows me to take a more objective look into it. The possibilities of predictive models with real world data is limitless, especially in a field such as finance.
