import yfinance as yf

def get_spy_data(start, end):
    # Download SPY data
    spy = yf.download("SPY", start=start, end=end)

    # Remove MultiIndex if it exists
    spy.columns = [col if isinstance(col, str) else col[0] for col in spy.columns]

    # Reset index so 'Date' becomes a column
    spy.reset_index(inplace=True)

    # Convert datetime to string for JSON serialization
    spy["Date"] = spy["Date"].dt.strftime("%Y-%m-%d")

    # Select columns (make sure they're strings now)
    spy_clean = spy[["Date", "Open", "High", "Low", "Close", "Volume"]]

    # Convert to list of dicts (JSON-serializable)
    return spy_clean.to_dict(orient="records")
