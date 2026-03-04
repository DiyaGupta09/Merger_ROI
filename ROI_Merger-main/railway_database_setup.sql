-- ============================================
-- MERGER ROI DASHBOARD - RAILWAY DATABASE SETUP
-- ============================================
-- Run this entire file in Railway MySQL Query tab
-- This will create all tables and populate with sample data
-- ============================================

-- Create database (Railway usually creates this, but just in case)
CREATE DATABASE IF NOT EXISTS merger_roi_db;
USE merger_roi_db;

-- ============================================
-- STEP 1: DROP EXISTING TABLES (Clean Start)
-- ============================================

DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS firm;

-- ============================================
-- STEP 2: CREATE TABLES
-- ============================================

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

-- ============================================
-- STEP 3: INSERT SAMPLE DATA - FIRMS
-- ============================================

INSERT INTO firm (firm_name, industry, founded_year, total_capital, headquarters) VALUES
('TechVision Inc', 'Technology', 2015, 5000000.00, 'San Francisco, CA'),
('DataFlow Systems', 'Technology', 2018, 3500000.00, 'Austin, TX'),
('CloudNet Solutions', 'Technology', 2017, 4200000.00, 'Seattle, WA'),
('FinanceHub Corp', 'Finance', 2012, 8000000.00, 'New York, NY'),
('RetailMax Group', 'Retail', 2010, 6500000.00, 'Chicago, IL'),
('HealthCare Plus', 'Healthcare', 2014, 7200000.00, 'Boston, MA'),
('EduTech Learning', 'Education', 2019, 2800000.00, 'Denver, CO'),
('GreenEnergy Co', 'Energy', 2011, 9500000.00, 'Houston, TX'),
('LogiTrans Inc', 'Logistics', 2016, 5500000.00, 'Atlanta, GA'),
('MediaWorks Studio', 'Media', 2020, 3200000.00, 'Los Angeles, CA');

-- ============================================
-- STEP 4: INSERT SAMPLE DATA - STAFF
-- ============================================

-- TechVision Inc (firm_id: 1)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(1, 'John Smith', 'CEO', 'Executive', '2015-01-15', 180000.00, 0.95),
(1, 'Sarah Johnson', 'CTO', 'Technology', '2015-03-20', 160000.00, 0.92),
(1, 'Mike Chen', 'VP Engineering', 'Technology', '2016-06-10', 140000.00, 0.88),
(1, 'Emily Davis', 'Senior Developer', 'Technology', '2017-02-14', 120000.00, 0.90),
(1, 'Robert Wilson', 'Product Manager', 'Product', '2018-05-22', 110000.00, 0.85);

-- DataFlow Systems (firm_id: 2)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(2, 'Lisa Anderson', 'CEO', 'Executive', '2018-01-10', 170000.00, 0.93),
(2, 'David Martinez', 'VP Sales', 'Sales', '2018-04-15', 130000.00, 0.89),
(2, 'Jennifer Lee', 'Data Scientist', 'Analytics', '2019-03-20', 115000.00, 0.91),
(2, 'Thomas Brown', 'Developer', 'Technology', '2019-07-01', 95000.00, 0.87);

-- CloudNet Solutions (firm_id: 3)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(3, 'Amanda White', 'CEO', 'Executive', '2017-02-01', 175000.00, 0.94),
(3, 'Kevin Taylor', 'VP Operations', 'Operations', '2017-05-10', 135000.00, 0.90),
(3, 'Rachel Green', 'Cloud Architect', 'Technology', '2018-08-15', 125000.00, 0.92),
(3, 'Chris Moore', 'DevOps Engineer', 'Technology', '2019-01-20', 105000.00, 0.88);

-- FinanceHub Corp (firm_id: 4)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(4, 'William Harris', 'CEO', 'Executive', '2012-03-01', 230000.00, 0.96),
(4, 'Patricia Clark', 'CFO', 'Finance', '2012-06-15', 200000.00, 0.94),
(4, 'James Lewis', 'VP Risk Management', 'Risk', '2013-09-10', 150000.00, 0.91),
(4, 'Maria Rodriguez', 'Senior Analyst', 'Analytics', '2015-02-20', 110000.00, 0.89),
(4, 'Daniel Walker', 'Compliance Officer', 'Legal', '2016-11-05', 120000.00, 0.87);

-- RetailMax Group (firm_id: 5)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(5, 'Barbara Hall', 'CEO', 'Executive', '2010-01-15', 190000.00, 0.93),
(5, 'Richard Allen', 'VP Retail Operations', 'Operations', '2011-04-20', 140000.00, 0.90),
(5, 'Susan Young', 'Store Manager', 'Retail', '2012-07-10', 85000.00, 0.88),
(5, 'Joseph King', 'Supply Chain Manager', 'Logistics', '2014-03-15', 95000.00, 0.86);

-- HealthCare Plus (firm_id: 6)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(6, 'Dr. Elizabeth Wright', 'CEO', 'Executive', '2014-02-01', 210000.00, 0.95),
(6, 'Dr. Michael Scott', 'Chief Medical Officer', 'Medical', '2014-05-10', 195000.00, 0.93),
(6, 'Nancy Adams', 'VP Patient Services', 'Operations', '2015-08-20', 135000.00, 0.91),
(6, 'Paul Baker', 'IT Director', 'Technology', '2016-11-15', 115000.00, 0.89);

-- EduTech Learning (firm_id: 7)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(7, 'Laura Nelson', 'CEO', 'Executive', '2019-01-10', 150000.00, 0.92),
(7, 'Steven Carter', 'VP Product', 'Product', '2019-03-15', 125000.00, 0.90),
(7, 'Michelle Mitchell', 'Content Director', 'Content', '2019-06-20', 95000.00, 0.88),
(7, 'Brian Perez', 'Developer', 'Technology', '2020-02-01', 85000.00, 0.86);

-- GreenEnergy Co (firm_id: 8)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(8, 'George Roberts', 'CEO', 'Executive', '2011-04-01', 220000.00, 0.96),
(8, 'Karen Turner', 'VP Engineering', 'Engineering', '2011-07-15', 165000.00, 0.94),
(8, 'Edward Phillips', 'Project Manager', 'Operations', '2013-10-20', 120000.00, 0.90),
(8, 'Dorothy Campbell', 'Environmental Analyst', 'Research', '2015-05-10', 100000.00, 0.88);

-- LogiTrans Inc (firm_id: 9)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(9, 'Charles Parker', 'CEO', 'Executive', '2016-03-01', 185000.00, 0.93),
(9, 'Betty Evans', 'VP Logistics', 'Operations', '2016-06-10', 145000.00, 0.91),
(9, 'Frank Edwards', 'Fleet Manager', 'Operations', '2017-09-15', 95000.00, 0.87),
(9, 'Helen Collins', 'Route Optimizer', 'Analytics', '2018-12-01', 90000.00, 0.89);

-- MediaWorks Studio (firm_id: 10)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(10, 'Anthony Stewart', 'CEO', 'Executive', '2020-01-15', 165000.00, 0.92),
(10, 'Carol Morris', 'Creative Director', 'Creative', '2020-03-20', 125000.00, 0.90),
(10, 'Gary Rogers', 'Producer', 'Production', '2020-06-10', 95000.00, 0.88),
(10, 'Donna Reed', 'Marketing Manager', 'Marketing', '2020-09-01', 85000.00, 0.86);

-- ============================================
-- STEP 5: INSERT SAMPLE DATA - SALES
-- ============================================

-- TechVision Inc Sales (firm_id: 1)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(1, 101, 'Cloud Platform License', DATE_SUB(CURDATE(), INTERVAL 90 DAY), 5, 50000.00, 250000.00, 'West', 'Enterprise'),
(1, 102, 'AI Analytics Suite', DATE_SUB(CURDATE(), INTERVAL 60 DAY), 3, 75000.00, 225000.00, 'West', 'Enterprise'),
(1, 101, 'Cloud Platform License', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 8, 50000.00, 400000.00, 'East', 'Mid-Market'),
(1, 103, 'Data Integration Tool', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 12, 25000.00, 300000.00, 'Central', 'Mid-Market'),
(1, 102, 'AI Analytics Suite', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 4, 75000.00, 300000.00, 'West', 'Enterprise');

-- DataFlow Systems Sales (firm_id: 2)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(2, 201, 'Data Pipeline Software', DATE_SUB(CURDATE(), INTERVAL 85 DAY), 6, 40000.00, 240000.00, 'Central', 'Enterprise'),
(2, 202, 'ETL Tool', DATE_SUB(CURDATE(), INTERVAL 55 DAY), 10, 15000.00, 150000.00, 'East', 'Mid-Market'),
(2, 201, 'Data Pipeline Software', DATE_SUB(CURDATE(), INTERVAL 25 DAY), 4, 40000.00, 160000.00, 'West', 'Enterprise'),
(2, 203, 'Data Quality Suite', DATE_SUB(CURDATE(), INTERVAL 12 DAY), 8, 20000.00, 160000.00, 'Central', 'Mid-Market'),
(2, 202, 'ETL Tool', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 15, 15000.00, 225000.00, 'East', 'SMB');

-- CloudNet Solutions Sales (firm_id: 3)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(3, 301, 'Cloud Infrastructure', DATE_SUB(CURDATE(), INTERVAL 95 DAY), 7, 60000.00, 420000.00, 'West', 'Enterprise'),
(3, 302, 'Security Suite', DATE_SUB(CURDATE(), INTERVAL 65 DAY), 5, 45000.00, 225000.00, 'East', 'Enterprise'),
(3, 301, 'Cloud Infrastructure', DATE_SUB(CURDATE(), INTERVAL 35 DAY), 9, 60000.00, 540000.00, 'Central', 'Enterprise'),
(3, 303, 'Monitoring Tools', DATE_SUB(CURDATE(), INTERVAL 18 DAY), 12, 18000.00, 216000.00, 'West', 'Mid-Market'),
(3, 302, 'Security Suite', DATE_SUB(CURDATE(), INTERVAL 8 DAY), 6, 45000.00, 270000.00, 'East', 'Enterprise');

-- FinanceHub Corp Sales (firm_id: 4)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(4, 401, 'Trading Platform', DATE_SUB(CURDATE(), INTERVAL 100 DAY), 3, 150000.00, 450000.00, 'East', 'Enterprise'),
(4, 402, 'Risk Analytics', DATE_SUB(CURDATE(), INTERVAL 70 DAY), 5, 80000.00, 400000.00, 'East', 'Enterprise'),
(4, 403, 'Compliance Software', DATE_SUB(CURDATE(), INTERVAL 40 DAY), 8, 55000.00, 440000.00, 'Central', 'Mid-Market'),
(4, 401, 'Trading Platform', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 4, 150000.00, 600000.00, 'West', 'Enterprise'),
(4, 402, 'Risk Analytics', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 6, 80000.00, 480000.00, 'East', 'Enterprise');

-- RetailMax Group Sales (firm_id: 5)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(5, 501, 'POS System', DATE_SUB(CURDATE(), INTERVAL 110 DAY), 20, 8000.00, 160000.00, 'Central', 'SMB'),
(5, 502, 'Inventory Management', DATE_SUB(CURDATE(), INTERVAL 80 DAY), 15, 12000.00, 180000.00, 'East', 'Mid-Market'),
(5, 503, 'Customer Loyalty Platform', DATE_SUB(CURDATE(), INTERVAL 50 DAY), 10, 15000.00, 150000.00, 'West', 'Mid-Market'),
(5, 501, 'POS System', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 25, 8000.00, 200000.00, 'South', 'SMB'),
(5, 502, 'Inventory Management', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 18, 12000.00, 216000.00, 'Central', 'Mid-Market');

-- HealthCare Plus Sales (firm_id: 6)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(6, 601, 'EMR System', DATE_SUB(CURDATE(), INTERVAL 120 DAY), 4, 120000.00, 480000.00, 'East', 'Enterprise'),
(6, 602, 'Patient Portal', DATE_SUB(CURDATE(), INTERVAL 90 DAY), 8, 35000.00, 280000.00, 'Central', 'Mid-Market'),
(6, 603, 'Telemedicine Platform', DATE_SUB(CURDATE(), INTERVAL 60 DAY), 6, 50000.00, 300000.00, 'West', 'Mid-Market'),
(6, 601, 'EMR System', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 5, 120000.00, 600000.00, 'East', 'Enterprise'),
(6, 602, 'Patient Portal', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 10, 35000.00, 350000.00, 'South', 'Mid-Market');

-- EduTech Learning Sales (firm_id: 7)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(7, 701, 'LMS Platform', DATE_SUB(CURDATE(), INTERVAL 130 DAY), 12, 25000.00, 300000.00, 'Central', 'Mid-Market'),
(7, 702, 'Course Creation Tool', DATE_SUB(CURDATE(), INTERVAL 100 DAY), 20, 8000.00, 160000.00, 'East', 'SMB'),
(7, 703, 'Student Analytics', DATE_SUB(CURDATE(), INTERVAL 70 DAY), 15, 12000.00, 180000.00, 'West', 'Mid-Market'),
(7, 701, 'LMS Platform', DATE_SUB(CURDATE(), INTERVAL 40 DAY), 10, 25000.00, 250000.00, 'South', 'Mid-Market'),
(7, 702, 'Course Creation Tool', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 25, 8000.00, 200000.00, 'Central', 'SMB');

-- GreenEnergy Co Sales (firm_id: 8)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(8, 801, 'Solar Panel Installation', DATE_SUB(CURDATE(), INTERVAL 140 DAY), 8, 180000.00, 1440000.00, 'West', 'Enterprise'),
(8, 802, 'Energy Management System', DATE_SUB(CURDATE(), INTERVAL 110 DAY), 5, 95000.00, 475000.00, 'Central', 'Enterprise'),
(8, 803, 'Battery Storage', DATE_SUB(CURDATE(), INTERVAL 80 DAY), 6, 120000.00, 720000.00, 'South', 'Enterprise'),
(8, 801, 'Solar Panel Installation', DATE_SUB(CURDATE(), INTERVAL 50 DAY), 10, 180000.00, 1800000.00, 'West', 'Enterprise'),
(8, 802, 'Energy Management System', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 7, 95000.00, 665000.00, 'East', 'Enterprise');

-- LogiTrans Inc Sales (firm_id: 9)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(9, 901, 'Fleet Management Software', DATE_SUB(CURDATE(), INTERVAL 150 DAY), 10, 45000.00, 450000.00, 'Central', 'Mid-Market'),
(9, 902, 'Route Optimization', DATE_SUB(CURDATE(), INTERVAL 120 DAY), 15, 28000.00, 420000.00, 'East', 'Mid-Market'),
(9, 903, 'Warehouse Management', DATE_SUB(CURDATE(), INTERVAL 90 DAY), 8, 55000.00, 440000.00, 'West', 'Enterprise'),
(9, 901, 'Fleet Management Software', DATE_SUB(CURDATE(), INTERVAL 60 DAY), 12, 45000.00, 540000.00, 'South', 'Mid-Market'),
(9, 902, 'Route Optimization', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 18, 28000.00, 504000.00, 'Central', 'Mid-Market');

-- MediaWorks Studio Sales (firm_id: 10)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(10, 1001, 'Video Production Service', DATE_SUB(CURDATE(), INTERVAL 160 DAY), 5, 75000.00, 375000.00, 'West', 'Enterprise'),
(10, 1002, 'Animation Package', DATE_SUB(CURDATE(), INTERVAL 130 DAY), 8, 45000.00, 360000.00, 'East', 'Mid-Market'),
(10, 1003, 'Marketing Campaign', DATE_SUB(CURDATE(), INTERVAL 100 DAY), 6, 60000.00, 360000.00, 'Central', 'Mid-Market'),
(10, 1001, 'Video Production Service', DATE_SUB(CURDATE(), INTERVAL 70 DAY), 7, 75000.00, 525000.00, 'West', 'Enterprise'),
(10, 1002, 'Animation Package', DATE_SUB(CURDATE(), INTERVAL 40 DAY), 10, 45000.00, 450000.00, 'South', 'Mid-Market');

-- ============================================
-- STEP 6: CREATE VIEWS FOR ANALYTICS
-- ============================================

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

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show table counts
SELECT 'Firms' as table_name, COUNT(*) as record_count FROM firm
UNION ALL
SELECT 'Staff' as table_name, COUNT(*) as record_count FROM staff
UNION ALL
SELECT 'Sales' as table_name, COUNT(*) as record_count FROM sales;

-- Show total revenue by firm
SELECT 
    f.firm_name,
    COUNT(s.sale_id) as total_sales,
    SUM(s.total_amount) as total_revenue
FROM firm f
LEFT JOIN sales s ON f.firm_id = s.firm_id
GROUP BY f.firm_id, f.firm_name
ORDER BY total_revenue DESC;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- You should see:
-- - 10 firms
-- - 44 staff members
-- - 50 sales transactions
-- - Total revenue across all firms
-- ============================================
