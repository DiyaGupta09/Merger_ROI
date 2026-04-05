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
        """Fetch key ratios + quarterly ROI for a ticker."""
        try:
            # Key ratios (ROE, ROI, P/E, revenue growth)
            ratios = self._get(f"/ratios-ttm/{ticker}")
            quote = self._get(f"/quote/{ticker}")

            if not ratios or not quote:
                return self._empty(ticker)

            r = ratios[0] if isinstance(ratios, list) else ratios
            q = quote[0] if isinstance(quote, list) else quote

            roi = round(float(r.get("returnOnInvestedCapitalTTM") or 0) * 100, 2)
            roe = round(float(r.get("returnOnEquityTTM") or 0) * 100, 2)
            pe  = round(float(r.get("peRatioTTM") or 0), 2)
            revenue_growth = round(float(r.get("revenueGrowthTTM") or 0) * 100, 2)
            profit_margin  = round(float(r.get("netProfitMarginTTM") or 0) * 100, 2)
            debt_equity    = round(float(r.get("debtEquityRatioTTM") or 0), 2)
            price = q.get("price", 0)
            change_pct = round(float(q.get("changesPercentage") or 0), 2)
            name = q.get("name", ticker)

            flags = self._generate_flags(roi, roe, revenue_growth, profit_margin, debt_equity, pe)

            return {
                "ticker": ticker,
                "name": name,
                "price": price,
                "change_pct": change_pct,
                "roi": roi,
                "roe": roe,
                "pe_ratio": pe,
                "revenue_growth": revenue_growth,
                "profit_margin": profit_margin,
                "debt_equity": debt_equity,
                "flags": flags,
                "overall": "green" if sum(1 for f in flags if f["type"] == "green") > len(flags) / 2 else "red",
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
            if not data:
                return []
            results = []
            for q in data[:quarters]:
                revenue = float(q.get("revenue") or 0)
                net_income = float(q.get("netIncome") or 0)
                op_expenses = float(q.get("operatingExpenses") or 0)
                total_cost = revenue - net_income
                roi = round((net_income / total_cost * 100) if total_cost > 0 else 0, 2)
                results.append({
                    "period": q.get("date", "")[:7],
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
    def _generate_flags(self, roi, roe, rev_growth, margin, debt_eq, pe) -> List[Dict]:
        flags = []
        flags.append({"metric": "ROI", "value": f"{roi:.1f}%",
                       "type": "green" if roi > 10 else "red",
                       "note": "Strong returns" if roi > 10 else "Weak returns"})
        flags.append({"metric": "Revenue Growth", "value": f"{rev_growth:.1f}%",
                       "type": "green" if rev_growth > 5 else "red",
                       "note": "Growing" if rev_growth > 5 else "Declining/flat"})
        flags.append({"metric": "Profit Margin", "value": f"{margin:.1f}%",
                       "type": "green" if margin > 10 else "amber" if margin > 0 else "red",
                       "note": "Healthy" if margin > 10 else "Thin margins"})
        flags.append({"metric": "Debt/Equity", "value": f"{debt_eq:.2f}",
                       "type": "green" if debt_eq < 1 else "amber" if debt_eq < 2 else "red",
                       "note": "Low leverage" if debt_eq < 1 else "High leverage"})
        flags.append({"metric": "P/E Ratio", "value": f"{pe:.1f}",
                       "type": "green" if 10 < pe < 30 else "amber",
                       "note": "Fair valued" if 10 < pe < 30 else "Check valuation"})
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
