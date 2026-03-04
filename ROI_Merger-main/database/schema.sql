-- Merger ROI Dashboard - Database Schema
-- MySQL 8.0+

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS firm;

-- Firm table
CREATE TABLE firm (
    firm_id INT PRIMARY KEY AUTO_INCREMENT,
    firm_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    founded_year INT,
    total_capital DECIMAL(15, 2) DEFAULT 0,
    headquarters VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_firm_name (firm_name),
    INDEX idx_industry (industry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Staff table
CREATE TABLE staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(12, 2) NOT NULL DEFAULT 0,
    performance_score DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (firm_id) REFERENCES firm(firm_id) ON DELETE CASCADE,
    INDEX idx_firm_id (firm_id),
    INDEX idx_department (department),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sales table
CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(255),
    sale_date DATE NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    territory VARCHAR(100),
    customer_segment VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firm_id) REFERENCES firm(firm_id) ON DELETE CASCADE,
    INDEX idx_firm_id (firm_id),
    INDEX idx_sale_date (sale_date),
    INDEX idx_territory (territory),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create views for common queries

-- Firm summary view
CREATE OR REPLACE VIEW v_firm_summary AS
SELECT 
    f.firm_id,
    f.firm_name,
    f.industry,
    f.total_capital,
    COUNT(DISTINCT s.staff_id) as staff_count,
    COALESCE(SUM(s.salary), 0) as total_salary,
    COALESCE(SUM(sales.revenue), 0) as total_revenue,
    COALESCE(COUNT(sales.transaction_count), 0) as transaction_count
FROM firm f
LEFT JOIN staff s ON f.firm_id = s.firm_id
LEFT JOIN (
    SELECT firm_id, SUM(total_amount) as revenue, COUNT(*) as transaction_count
    FROM sales
    GROUP BY firm_id
) sales ON f.firm_id = sales.firm_id
GROUP BY f.firm_id, f.firm_name, f.industry, f.total_capital;

-- Monthly sales view
CREATE OR REPLACE VIEW v_monthly_sales AS
SELECT 
    firm_id,
    DATE_FORMAT(sale_date, '%Y-%m') as period,
    COUNT(*) as transaction_count,
    SUM(quantity) as total_quantity,
    SUM(total_amount) as total_revenue
FROM sales
GROUP BY firm_id, DATE_FORMAT(sale_date, '%Y-%m');
