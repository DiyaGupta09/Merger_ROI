-- Merger ROI Dashboard - Sample Data
-- This provides realistic demo data for the dashboard

USE merger_roi_db;

-- Insert Firms
INSERT INTO firm (firm_name, industry, founded_year, total_capital, headquarters) VALUES
('TechVision Inc', 'Technology', 2015, 5000000.00, 'San Francisco, CA'),
('DataFlow Systems', 'Technology', 2018, 3500000.00, 'Austin, TX'),
('CloudNet Solutions', 'Technology', 2016, 4200000.00, 'Seattle, WA'),
('FinanceHub Corp', 'Finance', 2012, 8000000.00, 'New York, NY'),
('RetailMax Group', 'Retail', 2010, 6500000.00, 'Chicago, IL'),
('HealthCare Plus', 'Healthcare', 2014, 7200000.00, 'Boston, MA'),
('EduTech Learning', 'Education', 2017, 2800000.00, 'Denver, CO'),
('GreenEnergy Co', 'Energy', 2013, 9500000.00, 'Houston, TX'),
('LogiTrans Inc', 'Logistics', 2011, 5500000.00, 'Atlanta, GA'),
('MediaWorks Studio', 'Media', 2019, 3200000.00, 'Los Angeles, CA');

-- Insert Staff for TechVision Inc (firm_id = 1)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(1, 'John Smith', 'CEO', 'Executive', '2015-01-15', 180000.00, 0.95),
(1, 'Sarah Johnson', 'CTO', 'Technology', '2015-03-20', 160000.00, 0.92),
(1, 'Michael Chen', 'Senior Developer', 'Technology', '2016-06-10', 120000.00, 0.88),
(1, 'Emily Davis', 'Product Manager', 'Product', '2017-02-14', 110000.00, 0.90),
(1, 'David Wilson', 'Sales Director', 'Sales', '2015-08-01', 130000.00, 0.85),
(1, 'Lisa Anderson', 'Marketing Manager', 'Marketing', '2018-01-10', 95000.00, 0.87),
(1, 'Robert Taylor', 'Developer', 'Technology', '2019-04-15', 95000.00, 0.83),
(1, 'Jennifer Martinez', 'UX Designer', 'Design', '2018-09-20', 85000.00, 0.89),
(1, 'James Brown', 'DevOps Engineer', 'Technology', '2017-11-05', 105000.00, 0.91),
(1, 'Maria Garcia', 'HR Manager', 'Human Resources', '2016-03-12', 80000.00, 0.86);

-- Insert Staff for DataFlow Systems (firm_id = 2)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(2, 'William Jones', 'CEO', 'Executive', '2018-01-10', 170000.00, 0.93),
(2, 'Patricia Miller', 'VP Engineering', 'Technology', '2018-02-15', 145000.00, 0.90),
(2, 'Christopher Davis', 'Lead Developer', 'Technology', '2018-05-20', 115000.00, 0.87),
(2, 'Amanda Wilson', 'Data Scientist', 'Analytics', '2019-03-10', 125000.00, 0.92),
(2, 'Daniel Moore', 'Sales Manager', 'Sales', '2018-07-01', 100000.00, 0.84),
(2, 'Jessica Taylor', 'Marketing Lead', 'Marketing', '2019-01-15', 90000.00, 0.86),
(2, 'Matthew Anderson', 'Developer', 'Technology', '2020-02-20', 90000.00, 0.82),
(2, 'Ashley Thomas', 'Business Analyst', 'Analytics', '2019-08-12', 85000.00, 0.88);

-- Insert Staff for remaining firms (abbreviated for demo)
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(3, 'Kevin White', 'CEO', 'Executive', '2016-03-01', 175000.00, 0.94),
(3, 'Michelle Harris', 'VP Sales', 'Sales', '2016-06-15', 140000.00, 0.89),
(3, 'Brian Martin', 'Lead Engineer', 'Technology', '2017-01-20', 120000.00, 0.91),
(3, 'Nicole Thompson', 'Product Manager', 'Product', '2018-04-10', 105000.00, 0.87),
(3, 'Ryan Garcia', 'Developer', 'Technology', '2019-02-14', 95000.00, 0.85),
(4, 'Steven Rodriguez', 'CEO', 'Executive', '2012-01-15', 220000.00, 0.96),
(4, 'Laura Martinez', 'CFO', 'Finance', '2012-03-20', 190000.00, 0.94),
(4, 'Andrew Robinson', 'VP Operations', 'Operations', '2013-05-10', 160000.00, 0.90),
(4, 'Stephanie Clark', 'Senior Analyst', 'Analytics', '2014-07-15', 130000.00, 0.92),
(4, 'Joshua Lewis', 'Compliance Officer', 'Legal', '2015-02-20', 125000.00, 0.88);

-- More staff for other firms
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score) VALUES
(5, 'Brandon Walker', 'CEO', 'Executive', '2010-06-01', 200000.00, 0.91),
(5, 'Rachel Hall', 'Store Manager', 'Operations', '2011-03-15', 85000.00, 0.87),
(5, 'Justin Allen', 'Buyer', 'Procurement', '2012-08-20', 75000.00, 0.84),
(6, 'Gregory Young', 'CEO', 'Executive', '2014-02-10', 210000.00, 0.95),
(6, 'Samantha King', 'Medical Director', 'Medical', '2014-04-15', 185000.00, 0.93),
(7, 'Eric Wright', 'CEO', 'Executive', '2017-01-05', 150000.00, 0.89),
(7, 'Melissa Lopez', 'Dean of Studies', 'Academic', '2017-03-20', 120000.00, 0.91),
(8, 'Jonathan Hill', 'CEO', 'Executive', '2013-04-12', 230000.00, 0.94),
(8, 'Kimberly Scott', 'VP Engineering', 'Engineering', '2013-07-18', 180000.00, 0.92),
(9, 'Timothy Green', 'CEO', 'Executive', '2011-09-01', 190000.00, 0.90),
(10, 'Angela Adams', 'CEO', 'Executive', '2019-02-14', 165000.00, 0.88);

-- Insert Sales data for TechVision Inc (firm_id = 1) - Last 12 months
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(1, 101, 'Cloud Platform License', '2025-02-05', 5, 10000.00, 50000.00, 'West', 'Enterprise'),
(1, 102, 'Analytics Suite', '2025-02-10', 3, 15000.00, 45000.00, 'West', 'Enterprise'),
(1, 101, 'Cloud Platform License', '2025-01-15', 8, 10000.00, 80000.00, 'East', 'Enterprise'),
(1, 103, 'Security Module', '2025-01-20', 12, 5000.00, 60000.00, 'Central', 'Mid-Market'),
(1, 102, 'Analytics Suite', '2024-12-10', 6, 15000.00, 90000.00, 'West', 'Enterprise'),
(1, 101, 'Cloud Platform License', '2024-12-15', 10, 10000.00, 100000.00, 'East', 'Enterprise'),
(1, 104, 'API Gateway', '2024-11-05', 15, 3000.00, 45000.00, 'West', 'SMB'),
(1, 103, 'Security Module', '2024-11-20', 8, 5000.00, 40000.00, 'Central', 'Mid-Market'),
(1, 102, 'Analytics Suite', '2024-10-12', 4, 15000.00, 60000.00, 'East', 'Enterprise'),
(1, 101, 'Cloud Platform License', '2024-10-25', 7, 10000.00, 70000.00, 'West', 'Enterprise');

-- More sales for TechVision Inc
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(1, 103, 'Security Module', '2024-09-08', 10, 5000.00, 50000.00, 'Central', 'Mid-Market'),
(1, 104, 'API Gateway', '2024-09-22', 20, 3000.00, 60000.00, 'West', 'SMB'),
(1, 101, 'Cloud Platform License', '2024-08-14', 9, 10000.00, 90000.00, 'East', 'Enterprise'),
(1, 102, 'Analytics Suite', '2024-08-28', 5, 15000.00, 75000.00, 'West', 'Enterprise'),
(1, 103, 'Security Module', '2024-07-10', 11, 5000.00, 55000.00, 'Central', 'Mid-Market'),
(1, 104, 'API Gateway', '2024-07-25', 18, 3000.00, 54000.00, 'East', 'SMB'),
(1, 101, 'Cloud Platform License', '2024-06-05', 6, 10000.00, 60000.00, 'West', 'Enterprise'),
(1, 102, 'Analytics Suite', '2024-06-18', 4, 15000.00, 60000.00, 'Central', 'Enterprise'),
(1, 103, 'Security Module', '2024-05-12', 9, 5000.00, 45000.00, 'East', 'Mid-Market'),
(1, 104, 'API Gateway', '2024-05-26', 16, 3000.00, 48000.00, 'West', 'SMB');

-- Sales for DataFlow Systems (firm_id = 2)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(2, 201, 'Data Pipeline Pro', '2025-02-08', 4, 12000.00, 48000.00, 'South', 'Enterprise'),
(2, 202, 'ETL Suite', '2025-01-18', 6, 8000.00, 48000.00, 'West', 'Mid-Market'),
(2, 201, 'Data Pipeline Pro', '2024-12-12', 5, 12000.00, 60000.00, 'East', 'Enterprise'),
(2, 203, 'Data Warehouse', '2024-11-15', 3, 20000.00, 60000.00, 'Central', 'Enterprise'),
(2, 202, 'ETL Suite', '2024-10-20', 8, 8000.00, 64000.00, 'South', 'Mid-Market'),
(2, 201, 'Data Pipeline Pro', '2024-09-10', 4, 12000.00, 48000.00, 'West', 'Enterprise'),
(2, 203, 'Data Warehouse', '2024-08-22', 2, 20000.00, 40000.00, 'East', 'Enterprise'),
(2, 202, 'ETL Suite', '2024-07-14', 7, 8000.00, 56000.00, 'Central', 'Mid-Market'),
(2, 201, 'Data Pipeline Pro', '2024-06-08', 5, 12000.00, 60000.00, 'South', 'Enterprise'),
(2, 203, 'Data Warehouse', '2024-05-16', 3, 20000.00, 60000.00, 'West', 'Enterprise');

-- Sales for other firms (abbreviated)
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(3, 301, 'Cloud Storage', '2025-02-01', 10, 5000.00, 50000.00, 'West', 'Enterprise'),
(3, 302, 'Backup Solution', '2025-01-10', 15, 3000.00, 45000.00, 'East', 'Mid-Market'),
(3, 301, 'Cloud Storage', '2024-12-05', 12, 5000.00, 60000.00, 'Central', 'Enterprise'),
(4, 401, 'Investment Platform', '2025-02-03', 2, 50000.00, 100000.00, 'East', 'Enterprise'),
(4, 402, 'Trading System', '2025-01-12', 3, 35000.00, 105000.00, 'East', 'Enterprise'),
(4, 401, 'Investment Platform', '2024-12-08', 2, 50000.00, 100000.00, 'Central', 'Enterprise'),
(5, 501, 'Retail POS System', '2025-02-06', 8, 8000.00, 64000.00, 'Central', 'Retail'),
(5, 502, 'Inventory Management', '2025-01-15', 10, 6000.00, 60000.00, 'Central', 'Retail'),
(6, 601, 'Patient Management', '2025-02-04', 5, 15000.00, 75000.00, 'East', 'Healthcare'),
(6, 602, 'Medical Records', '2025-01-20', 4, 12000.00, 48000.00, 'East', 'Healthcare');

-- More sales data for remaining firms
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment) VALUES
(7, 701, 'Learning Platform', '2025-02-02', 20, 2000.00, 40000.00, 'West', 'Education'),
(7, 702, 'Course Management', '2025-01-14', 15, 2500.00, 37500.00, 'Central', 'Education'),
(8, 801, 'Solar Panel System', '2025-02-07', 3, 80000.00, 240000.00, 'South', 'Enterprise'),
(8, 802, 'Wind Turbine', '2025-01-16', 2, 120000.00, 240000.00, 'Central', 'Enterprise'),
(9, 901, 'Fleet Management', '2025-02-09', 6, 10000.00, 60000.00, 'South', 'Logistics'),
(9, 902, 'Route Optimization', '2025-01-22', 8, 7500.00, 60000.00, 'Central', 'Logistics'),
(10, 1001, 'Video Production', '2025-02-11', 4, 15000.00, 60000.00, 'West', 'Media'),
(10, 1002, 'Editing Suite', '2025-01-25', 5, 10000.00, 50000.00, 'West', 'Media');

-- Summary: Database initialized with 10 firms, 40+ staff, and 50+ sales transactions
