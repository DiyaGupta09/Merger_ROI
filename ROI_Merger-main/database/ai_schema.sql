-- AI Platform Schema Extensions
-- Run after schema.sql

CREATE TABLE IF NOT EXISTS roi_timeseries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT NOT NULL,
    timestamp DATE NOT NULL,
    roi DECIMAL(10,4),
    equity DECIMAL(15,2),
    task_count INT DEFAULT 0,
    budget_allocated DECIMAL(15,2) DEFAULT 0,
    cash_flow DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firm_id) REFERENCES firm(firm_id) ON DELETE CASCADE,
    INDEX idx_firm_ts (firm_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS department_budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    allocated_budget DECIMAL(15,2) DEFAULT 0,
    spent_budget DECIMAL(15,2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firm_id) REFERENCES firm(firm_id) ON DELETE CASCADE,
    INDEX idx_firm_dept (firm_id, department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS simulation_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT,
    simulation_type VARCHAR(50) DEFAULT 'rl_vs_current',
    current_roi DECIMAL(10,4),
    optimized_roi DECIMAL(10,4),
    improvement_pct DECIMAL(8,4),
    recommendations JSON,
    decision_trace JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_firm_sim (firm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ai_insights (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT,
    insight_type VARCHAR(50),
    content TEXT,
    feature_importance JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_firm_insight (firm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed roi_timeseries with synthetic data derived from existing sales
INSERT IGNORE INTO roi_timeseries (firm_id, timestamp, roi, equity, task_count, budget_allocated, cash_flow)
SELECT 
    s.firm_id,
    DATE_FORMAT(s.sale_date, '%Y-%m-01') as timestamp,
    ROUND((SUM(s.total_amount) - COALESCE(st.total_salary,0)) / NULLIF(COALESCE(st.total_salary,0),0) * 100, 4) as roi,
    f.total_capital as equity,
    COUNT(s.sale_id) as task_count,
    COALESCE(st.total_salary,0) * 1.2 as budget_allocated,
    SUM(s.total_amount) - COALESCE(st.total_salary,0) as cash_flow
FROM sales s
JOIN firm f ON s.firm_id = f.firm_id
LEFT JOIN (SELECT firm_id, SUM(salary)/12 as total_salary FROM staff GROUP BY firm_id) st ON st.firm_id = s.firm_id
GROUP BY s.firm_id, DATE_FORMAT(s.sale_date, '%Y-%m-01'), f.total_capital, st.total_salary;

-- Seed department_budgets
INSERT IGNORE INTO department_budgets (firm_id, department, allocated_budget, spent_budget, period_start, period_end)
SELECT 
    firm_id,
    department,
    SUM(salary) * 1.3 as allocated_budget,
    SUM(salary) as spent_budget,
    '2024-01-01' as period_start,
    '2024-12-31' as period_end
FROM staff
GROUP BY firm_id, department;
