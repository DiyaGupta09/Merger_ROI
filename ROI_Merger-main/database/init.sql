-- Database Initialization Script
-- This script creates the database and loads schema + data

CREATE DATABASE IF NOT EXISTS merger_roi_db;
USE merger_roi_db;

-- Load schema
SOURCE /docker-entrypoint-initdb.d/schema.sql;

-- Load sample data
SOURCE /docker-entrypoint-initdb.d/seed_data.sql;

-- Verify data loaded
SELECT 'Database initialized successfully!' as status;
SELECT COUNT(*) as firm_count FROM firm;
SELECT COUNT(*) as staff_count FROM staff;
SELECT COUNT(*) as sales_count FROM sales;
