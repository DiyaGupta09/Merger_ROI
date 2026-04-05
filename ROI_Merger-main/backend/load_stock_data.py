"""
Load real stock CSV data into Railway MySQL database.
Creates stock_prices table and computes quarterly ROI per ticker.
Run once: python load_stock_data.py
"""
import pymysql
import csv
import os
from datetime import datetime

# Railway connection
conn = pymysql.connect(
    host='junction.proxy.rlwy.net',
    port=35299,
    user='root',
    password='fqPjOApiSFGaVawhdnkdzTKQhWQcSHto',
    database='railway',
    charset='utf8mb4',
    autocommit=True
)

TICKERS = ['AAPL','ADBE','AMZN','CRM','CSCO','GOOGL','IBM','INTC','META','MSFT','NFLX','NVDA','ORCL','TSLA']
DATA_DIR = '../archive (2)'

with conn.cursor() as cur:
    # Create tables
    cur.execute("DROP TABLE IF EXISTS stock_quarterly_roi")
    cur.execute("DROP TABLE IF EXISTS stock_prices")

    cur.execute("""
        CREATE TABLE stock_prices (
            id INT PRIMARY KEY AUTO_INCREMENT,
            ticker VARCHAR(10) NOT NULL,
            date DATE NOT NULL,
            open_price DECIMAL(12,4),
            high_price DECIMAL(12,4),
            low_price DECIMAL(12,4),
            close_price DECIMAL(12,4),
            adj_close DECIMAL(12,4),
            volume BIGINT,
            INDEX idx_ticker_date (ticker, date)
        ) ENGINE=InnoDB
    """)

    cur.execute("""
        CREATE TABLE stock_quarterly_roi (
            id INT PRIMARY KEY AUTO_INCREMENT,
            ticker VARCHAR(10) NOT NULL,
            quarter VARCHAR(7) NOT NULL,
            start_price DECIMAL(12,4),
            end_price DECIMAL(12,4),
            roi DECIMAL(10,4),
            avg_volume BIGINT,
            INDEX idx_ticker (ticker),
            INDEX idx_quarter (quarter)
        ) ENGINE=InnoDB
    """)
    print("Tables created.")

    # Load each CSV
    for ticker in TICKERS:
        path = os.path.join(DATA_DIR, f'{ticker}.csv')
        if not os.path.exists(path):
            print(f"  Skipping {ticker} - file not found")
            continue

        rows = []
        with open(path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    rows.append((
                        ticker,
                        row['Date'],
                        float(row['Open']),
                        float(row['High']),
                        float(row['Low']),
                        float(row['Close']),
                        float(row['Adj Close']),
                        int(float(row['Volume'])),
                    ))
                except Exception:
                    continue

        # Batch insert
        if rows:
            cur.executemany("""
                INSERT INTO stock_prices (ticker, date, open_price, high_price, low_price, close_price, adj_close, volume)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """, rows)
            print(f"  {ticker}: {len(rows)} rows loaded")

    print("Stock prices loaded.")

    # Compute quarterly ROI for each ticker
    for ticker in TICKERS:
        cur.execute("""
            SELECT
                CONCAT(YEAR(date), '-Q', QUARTER(date)) as quarter,
                MIN(date) as start_date,
                MAX(date) as end_date,
                AVG(volume) as avg_vol
            FROM stock_prices
            WHERE ticker = %s
            GROUP BY YEAR(date), QUARTER(date)
            ORDER BY start_date ASC
        """, (ticker,))
        quarters = cur.fetchall()

        for q in quarters:
            quarter = q['quarter']
            start_date = q['start_date']
            end_date = q['end_date']
            avg_vol = int(q['avg_vol'] or 0)

            # Get start and end prices
            cur.execute("SELECT adj_close FROM stock_prices WHERE ticker=%s AND date=%s", (ticker, start_date))
            s = cur.fetchone()
            cur.execute("SELECT adj_close FROM stock_prices WHERE ticker=%s AND date=%s", (ticker, end_date))
            e = cur.fetchone()

            if s and e:
                start_p = float(s['adj_close'])
                end_p = float(e['adj_close'])
                roi = round(((end_p - start_p) / start_p * 100) if start_p > 0 else 0, 4)
                cur.execute("""
                    INSERT INTO stock_quarterly_roi (ticker, quarter, start_price, end_price, roi, avg_volume)
                    VALUES (%s,%s,%s,%s,%s,%s)
                """, (ticker, quarter, start_p, end_p, roi, avg_vol))

        print(f"  {ticker}: quarterly ROI computed")

    # Verify
    cur.execute("SELECT COUNT(*) as c FROM stock_prices")
    print(f"\nTotal stock_prices rows: {cur.fetchone()['c']}")
    cur.execute("SELECT COUNT(*) as c FROM stock_quarterly_roi")
    print(f"Total quarterly_roi rows: {cur.fetchone()['c']}")
    cur.execute("SELECT ticker, COUNT(*) as quarters FROM stock_quarterly_roi GROUP BY ticker ORDER BY ticker")
    for r in cur.fetchall():
        print(f"  {r['ticker']}: {r['quarters']} quarters")

conn.close()
print("\nDone! Real stock data loaded into Railway DB.")
