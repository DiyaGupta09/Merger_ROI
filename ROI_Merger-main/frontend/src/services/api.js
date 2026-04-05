import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://roimerger-production.up.railway.app';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const api = {
  // --- Existing ---
  getDashboardSummary: () => client.get('/api/dashboard/summary').then(r => r.data),
  getFirms: (limit) => client.get('/api/firms', { params: limit ? { limit } : {} }).then(r => r.data),
  getROI: (firmId) => client.get('/api/roi', { params: firmId ? { firm_id: firmId } : {} }).then(r => r.data),
  getBottlenecks: () => client.get('/api/bottlenecks').then(r => r.data),
  getResourceRecommendations: () => client.get('/api/resources/recommendations').then(r => r.data),
  analyzeMerger: (a, b) => client.post('/api/merger/analyze', null, { params: { firm_a_id: a, firm_b_id: b } }).then(r => r.data),

  // --- AI Endpoints ---
  getForecast: (firmId = 1) => client.get('/api/forecast', { params: { firm_id: firmId } }).then(r => r.data),
  getExplanation: (firmId = 1) => client.get('/api/explain', { params: { firm_id: firmId } }).then(r => r.data),
  getOptimization: (firmId = 1, train = false) => client.get('/api/optimize', { params: { firm_id: firmId, train } }).then(r => r.data),
  getSimulation: (firmId = 1) => client.get('/api/simulate', { params: { firm_id: firmId } }).then(r => r.data),
  getMarketData: (symbol = 'SPY') => client.get('/api/market', { params: { symbol } }).then(r => r.data),
  getTimeseries: (firmId = 1) => client.get('/api/timeseries', { params: { firm_id: firmId } }).then(r => r.data),
  getHealth: () => client.get('/api/health').then(r => r.data),

  // Real archive stock data (from CSV dataset loaded into DB)
  getStockQuarterly: (ticker = 'AAPL', limit = 20) => client.get('/api/stocks/quarterly', { params: { ticker, limit } }).then(r => r.data),
  getAvailableTickers: () => client.get('/api/stocks/tickers').then(r => r.data),
  compareStocks: (a, b) => client.get('/api/stocks/compare', { params: { ticker_a: a, ticker_b: b } }).then(r => r.data),
};

export default api;
