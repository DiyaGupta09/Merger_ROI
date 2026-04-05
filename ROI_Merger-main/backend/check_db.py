import pymysql
conn = pymysql.connect(host='junction.proxy.rlwy.net',port=35299,user='root',
    password='fqPjOApiSFGaVawhdnkdzTKQhWQcSHto',database='railway',
    charset='utf8mb4',autocommit=True,cursorclass=pymysql.cursors.DictCursor)
with conn.cursor() as cur:
    cur.execute("SELECT COUNT(*) as c FROM stock_quarterly_roi")
    print("Quarterly rows:", cur.fetchone()['c'])
    cur.execute("SELECT ticker, COUNT(*) as q FROM stock_quarterly_roi GROUP BY ticker ORDER BY ticker")
    for r in cur.fetchall():
        print(f"  {r['ticker']}: {r['q']} quarters")
conn.close()
