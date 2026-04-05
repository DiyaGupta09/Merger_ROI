import pymysql

conn = pymysql.connect(
    host='junction.proxy.rlwy.net', port=35299,
    user='root', password='fqPjOApiSFGaVawhdnkdzTKQhWQcSHto',
    database='railway', charset='utf8mb4',
    autocommit=True, cursorclass=pymysql.cursors.DictCursor
)

TICKERS = ['AAPL','ADBE','AMZN','CRM','CSCO','GOOGL','IBM','INTC','META','MSFT','NFLX','NVDA','ORCL','TSLA']

with conn.cursor() as cur:
    cur.execute("DROP TABLE IF EXISTS stock_quarterly_roi")
    cur.execute("""
        CREATE TABLE stock_quarterly_roi (
            id INT PRIMARY KEY AUTO_INCREMENT,
            ticker VARCHAR(10) NOT NULL,
            quarter VARCHAR(10) NOT NULL,
            start_price DECIMAL(12,4),
            end_price DECIMAL(12,4),
            roi DECIMAL(10,4),
            avg_volume BIGINT,
            INDEX idx_ticker (ticker)
        ) ENGINE=InnoDB
    """)
    print("Table created.")

    for ticker in TICKERS:
        q_sql = """
            SELECT
                YEAR(date) as yr,
                QUARTER(date) as qtr,
                MIN(date) as sd,
                MAX(date) as ed,
                AVG(volume) as av
            FROM stock_prices
            WHERE ticker = %s
            GROUP BY YEAR(date), QUARTER(date)
            ORDER BY sd ASC
        """
        cur.execute(q_sql, (ticker,))
        quarters = cur.fetchall()

        inserted = 0
        for q in quarters:
            quarter_label = f"{q['yr']}-Q{q['qtr']}"
            cur.execute(
                "SELECT adj_close FROM stock_prices WHERE ticker=%s AND date=%s",
                (ticker, q['sd'])
            )
            s = cur.fetchone()
            cur.execute(
                "SELECT adj_close FROM stock_prices WHERE ticker=%s AND date=%s",
                (ticker, q['ed'])
            )
            e = cur.fetchone()
            if s and e:
                sp = float(s['adj_close'])
                ep = float(e['adj_close'])
                roi = round(((ep - sp) / sp * 100) if sp > 0 else 0, 4)
                cur.execute(
                    "INSERT INTO stock_quarterly_roi (ticker,quarter,start_price,end_price,roi,avg_volume) VALUES (%s,%s,%s,%s,%s,%s)",
                    (ticker, quarter_label, sp, ep, roi, int(q['av'] or 0))
                )
                inserted += 1
        print(f"  {ticker}: {inserted} quarters")

    cur.execute("SELECT COUNT(*) as c FROM stock_quarterly_roi")
    print(f"\nTotal rows: {cur.fetchone()['c']}")

conn.close()
print("Done!")
