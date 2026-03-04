import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import MergerAnalysis from './components/MergerAnalysis';
import Header from './components/Header';
import api from './services/api';

function App() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Header />

      <nav className="main-nav">
        <div className="nav-container">
          <button
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Executive Dashboard
          </button>
          <button
            className={`nav-button ${activeTab === 'merger' ? 'active' : ''}`}
            onClick={() => setActiveTab('merger')}
          >
            🤝 Merger Analysis
          </button>
        </div>
      </nav>

      <main className="main-content">
        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Gathering financial intelligence...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' ? (
              <Dashboard summary={summary} />
            ) : (
              <MergerAnalysis />
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 Merger ROI Analytics Engine. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
