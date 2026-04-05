"""
Market Intelligence Agent - Fetches real quarterly financials,
ROI, red/green flags from Financial Modeling Prep (FMP) API.
Used to benchmark internal firm performance against public markets.
"""
import os
import logging
import requests
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

FMP_KEY = os.getenv("FMP_API_KEY", "kCKjp0j9KbRTBGHnFlZiy2lutET25huE")
FMP_BASE = "https://financialmodelingprep.com/api/v3"

# Default benchmark tickers mapped to industries in our DB
INDUSTRY_BENCHMARKS = {
    "Technology":  ["AAPL", "MSFT", "GOOGL"],
    "Finance":     ["JPM", "GS", "BAC"],
    "Healthcare":  ["JNJ", "UNH", "PFE"],
    "Retail":      ["WMT", "AMZN", "TGT"],
    "Energy":      ["XOM", "CVX", "NEE"],
    "Logistics":   ["UPS", "FDX", "CHRW"],
    "Education":   ["CHGG", "LOPE", "PRDO"],
    "Media":       ["DIS", "NFLX", "PARA"],
    "default":     ["SPY", "QQQ", "DIA"],
}


class MarketIntelligence:
    """Fetches real market data and generates red/green flags."""

    # ------------------------------------------------------------------
    def get_stock_fundamentals(self, ticker: str) -> Dict[str, Any]:
        """Fetch key ratios + quote for a ticker using free FMP endpoints."""
        try:
            quote = self._get(f"/quote/{ticker}")
            profile = self._get(f"/profile/{ticker}")

            if not quote:
                return self._empty(ticker)

            q = quote[0] if isinstance(quote, list) else quote
            p = (profile[0] if isinstance(profile, list) else profile) if profile else {}

            price = q.get("price", 0)
            change_pct = round(float(q.get("changesPercentage") or 0), 2)
            name = q.get("name", ticker)
            pe = round(float(q.get("pe") or 0), 2)
            eps = round(float(q.get("eps") or 0), 2)
            market_cap = q.get("marketCap", 0)
            year_high = q.get("yearHigh", 0)
            year_low = q.get("yearLow", 0)
            avg_volume = q.get("avgVolume", 0)

            # Compute simple ROI proxy from price vs 52w low
            roi = round(((price - year_low) / year_low * 100) if year_low > 0 else 0, 2)
            # Revenue growth proxy from EPS
            revenue_growth = round(change_pct, 2)
            profit_margin = round((eps / price * 100) if price > 0 else 0, 2)
            debt_equity = round(float(p.get("debtToEquity") or 1.0), 2)
            beta = round(float(q.get("beta") or 1.0), 2)

            flags = self._generate_flags(roi, revenue_growth, profit_margin, debt_equity, pe, beta)

            return {
                "ticker": ticker,
                "name": name,
                "price": price,
                "change_pct": change_pct,
                "roi": roi,
                "pe_ratio": pe,
                "eps": eps,
                "revenue_growth": revenue_growth,
                "profit_margin": profit_margin,
                "debt_equity": debt_equity,
                "market_cap": market_cap,
                "year_high": year_high,
                "year_low": year_low,
                "beta": beta,
                "flags": flags,
                "overall": "green" if sum(1 for f in flags if f["type"] == "green") >= 3 else "red",
            }
        except Exception as e:
            logger.warning(f"FMP fundamentals failed for {ticker}: {e}")
            return self._empty(ticker)

    # ------------------------------------------------------------------
    def get_industry_benchmarks(self, industry: str) -> List[Dict[str, Any]]:
        """Get benchmark stocks for a given industry."""
        tickers = INDUSTRY_BENCHMARKS.get(industry, INDUSTRY_BENCHMARKS["default"])
        results = []
        for t in tickers:
            data = self.get_stock_fundamentals(t)
            if data.get("name"):
                results.append(data)
        return results

    # ------------------------------------------------------------------
    def get_quarterly_roi(self, ticker: str, quarters: int = 4) -> List[Dict]:
        """Fetch quarterly income statement to compute ROI per quarter."""
        try:
            data = self._get(f"/income-statement/{ticker}?period=quarter&limit={quarters}")
            if not data or isinstance(data, dict):
                return []
            results = []
            for q in data[:quarters]:
                revenue = float(q.get("revenue") or 0)
                net_income = float(q.get("netIncome") or 0)
                total_cost = revenue - net_income
                roi = round((net_income / total_cost * 100) if total_cost > 0 else 0, 2)
                results.append({
                    "period": str(q.get("date", ""))[:7],
                    "revenue": revenue,
                    "net_income": net_income,
                    "roi": roi,
                    "eps": round(float(q.get("eps") or 0), 2),
                })
            return results
        except Exception as e:
            logger.warning(f"Quarterly ROI failed for {ticker}: {e}")
            return []

    # ------------------------------------------------------------------
    def compare_with_market(self, internal_roi: float, industry: str) -> Dict[str, Any]:
        """Compare internal firm ROI against market benchmarks."""
        benchmarks = self.get_industry_benchmarks(industry)
        if not benchmarks:
            return {"comparison": "unavailable", "benchmarks": []}

        market_rois = [b["roi"] for b in benchmarks if b["roi"] != 0]
        avg_market_roi = round(sum(market_rois) / len(market_rois), 2) if market_rois else 0

        delta = round(internal_roi - avg_market_roi, 2)
        performance = "outperforming" if delta > 0 else "underperforming"

        return {
            "internal_roi": internal_roi,
            "avg_market_roi": avg_market_roi,
            "delta": delta,
            "performance": performance,
            "industry": industry,
            "benchmarks": benchmarks,
            "insight": (
                f"Your firm's ROI of {internal_roi:.1f}% is {abs(delta):.1f}% "
                f"{performance} the {industry} sector average of {avg_market_roi:.1f}%."
            ),
        }

    # ------------------------------------------------------------------
    def _generate_flags(self, roi, rev_growth, margin, debt_eq, pe, beta) -> List[Dict]:
        flags = []
        flags.append({"metric": "52W ROI", "value": f"{roi:.1f}%",
                       "type": "green" if roi > 10 else "red",
                       "note": "Strong 52W return" if roi > 10 else "Weak 52W return"})
        flags.append({"metric": "Today's Change", "value": f"{rev_growth:.1f}%",
                       "type": "green" if rev_growth > 0 else "red",
                       "note": "Positive momentum" if rev_growth > 0 else "Negative momentum"})
        flags.append({"metric": "EPS Margin", "value": f"{margin:.1f}%",
                       "type": "green" if margin > 5 else "amber" if margin > 0 else "red",
                       "note": "Profitable" if margin > 5 else "Thin/negative"})
        flags.append({"metric": "P/E Ratio", "value": f"{pe:.1f}",
                       "type": "green" if 8 < pe < 35 else "amber" if pe > 0 else "red",
                       "note": "Fair valued" if 8 < pe < 35 else "Check valuation"})
        flags.append({"metric": "Beta", "value": f"{beta:.2f}",
                       "type": "green" if beta < 1.2 else "amber" if beta < 1.8 else "red",
                       "note": "Low volatility" if beta < 1.2 else "High volatility"})
        return flags

    # ------------------------------------------------------------------
    def _get(self, path: str) -> Any:
        url = f"{FMP_BASE}{path}"
        sep = "&" if "?" in path else "?"
        resp = requests.get(f"{url}{sep}apikey={FMP_KEY}", timeout=8)
        resp.raise_for_status()
        return resp.json()

    def _empty(self, ticker: str) -> Dict:
        return {"ticker": ticker, "name": ticker, "roi": 0, "flags": [], "overall": "unknown"}
