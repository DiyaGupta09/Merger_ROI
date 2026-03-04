# 📊 Merger ROI Dashboard
### Strategic Business Intelligence & Resource Optimization Engine

[![Railway Deployment](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=for-the-badge&logo=railway)](https://railway.app)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL_8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

A premium SaaS platform designed for C-suite executives and financial analysts to simulate mergers, measure capital efficiency, and detect performance bottlenecks using **transparent statistical analysis**.

---

## 🌟 Key Features

### 🤝 Merger Analysis Engine
*   **Predictive Synergies:** Simulate firm mergers to estimate combined revenue and cost savings.
*   **Equity Distribution:** Automated calculation of fair equity splits based on capital contribution.
*   **ROI Projections:** Real-time ROI forecasting for potential acquisitions.

### 📈 Executive Insights
*   **ROI Industry Ranking:** Live leaderboard of firms ranked by capital efficiency.
*   **Capital Productivity Metrics:** Deep dive into revenue per employee and aggregate production functions.
*   **Bottleneck Detection:** Automated identification of firms with declining sales trends or resource constraints.

### 👥 Resource Optimization
*   **Staff Reallocation:** Data-driven recommendations for moving human capital to high-ROI departments.
*   **Efficiency Analytics:** Compare performance across different territories and customer segments.

---

## 🛠️ Technical Architecture

| Layer | Technology | Key Modules |
| :--- | :--- | :--- |
| **Frontend** | React 18 / Recharts | Dashboard, Merger Engine, API Service |
| **Backend** | Python / FastAPI | ROI Calculator, Bottleneck Detector, Resource Optimizer |
| **Database** | MySQL 8.0 | Normalized Schema, Performance Views |
| **DevOps** | Docker / Railway | Multi-container setup, Auto-initialization |

---

## 🚀 Quick Start (Local)

### 1. Setup Environment
```bash
cp .env.example .env
# Edit .env and set your DB_PASSWORD
```

### 2. Launch with Docker (Recommended)
```bash
docker-compose up --build
```
*   **Dashboard:** [http://localhost:3000](http://localhost:3000)
*   **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
*   **Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 3. One-Click Startup (Windows)
Just run `start.bat` in the root directory. It will validate your environment and launch the containers for you.

---

## 🚂 Cloud Deployment (Railway)

This project is optimized for **Railway**.
1.  Connect your GitHub repository to Railway.
2.  Add a **MySQL** service.
3.  Run the contents of `railway_database_setup.sql` in the Railway SQL editor to seed the demo data.
4.  Configure the environment variables (see `DEPLOY_TO_RAILWAY.md` for details).

---

## 📂 Project Structure

```text
├── backend/            # FastAPI analytics engine
├── frontend/           # React dashboard UI
├── database/           # SQL schema and seed data
├── docker-compose.yml  # Container orchestration
├── start.bat           # Windows one-click startup
└── railway.json        # Railway service configuration
```

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed for the Frostbyte Hackathon 2026**
*Strategic Tools for a Data-Driven Future*
