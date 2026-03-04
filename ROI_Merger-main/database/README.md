# Database Setup Guide

## Automatic Setup (Docker - Recommended)

If using Docker Compose, the database is automatically initialized with schema and sample data.

Just run:
```bash
docker-compose up --build
```

The init scripts will run automatically on first startup.

---

## Manual Setup (Existing MySQL)

If you have an existing MySQL instance and want to set it up manually:

### Step 1: Create Database
```sql
CREATE DATABASE merger_roi_db;
USE merger_roi_db;
```

### Step 2: Run Schema
```bash
mysql -u root -p merger_roi_db < database/schema.sql
```

Or manually in MySQL:
```sql
SOURCE /path/to/database/schema.sql;
```

### Step 3: Load Sample Data
```bash
mysql -u root -p merger_roi_db < database/seed_data.sql
```

Or manually in MySQL:
```sql
SOURCE /path/to/database/seed_data.sql;
```

### Step 4: Verify
```sql
USE merger_roi_db;
SELECT COUNT(*) FROM firm;      -- Should return 10
SELECT COUNT(*) FROM staff;     -- Should return 40+
SELECT COUNT(*) FROM sales;     -- Should return 50+
```

### Step 5: Update .env
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=merger_roi_db
```

---

## Database Schema

### Tables

#### firm
- Primary table for company information
- Fields: firm_id, firm_name, industry, founded_year, total_capital, headquarters
- Indexes: firm_name, industry

#### staff
- Employee information linked to firms
- Fields: staff_id, firm_id, name, role, department, hire_date, salary, performance_score
- Foreign Key: firm_id → firm.firm_id
- Indexes: firm_id, department, role

#### sales
- Transaction records
- Fields: sale_id, firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment
- Foreign Key: firm_id → firm.firm_id
- Indexes: firm_id, sale_date, territory, product_id

### Views

#### v_firm_summary
Aggregated firm metrics including staff count, total salary, and revenue.

#### v_monthly_sales
Monthly sales aggregations by firm.

---

## Sample Data Overview

### 10 Firms Across Industries:
1. TechVision Inc (Technology)
2. DataFlow Systems (Technology)
3. CloudNet Solutions (Technology)
4. FinanceHub Corp (Finance)
5. RetailMax Group (Retail)
6. HealthCare Plus (Healthcare)
7. EduTech Learning (Education)
8. GreenEnergy Co (Energy)
9. LogiTrans Inc (Logistics)
10. MediaWorks Studio (Media)

### 40+ Staff Members
- Various roles: CEO, CTO, Developers, Managers, etc.
- Realistic salary ranges: $75,000 - $230,000
- Performance scores: 0.82 - 0.96

### 50+ Sales Transactions
- Date range: Last 12 months
- Multiple products per firm
- Various territories: East, West, Central, South
- Customer segments: Enterprise, Mid-Market, SMB

---

## Customizing Data

### Add Your Own Firms
```sql
INSERT INTO firm (firm_name, industry, founded_year, total_capital, headquarters)
VALUES ('Your Company', 'Your Industry', 2020, 1000000.00, 'Your City');
```

### Add Staff
```sql
INSERT INTO staff (firm_id, name, role, department, hire_date, salary, performance_score)
VALUES (1, 'John Doe', 'Developer', 'Technology', '2024-01-15', 95000.00, 0.85);
```

### Add Sales
```sql
INSERT INTO sales (firm_id, product_id, product_name, sale_date, quantity, unit_price, total_amount, territory, customer_segment)
VALUES (1, 101, 'Product Name', '2025-02-01', 5, 1000.00, 5000.00, 'West', 'Enterprise');
```

---

## Resetting Data

### Clear All Data (Keep Schema)
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE sales;
TRUNCATE TABLE staff;
TRUNCATE TABLE firm;
SET FOREIGN_KEY_CHECKS = 1;
```

### Complete Reset
```sql
DROP DATABASE merger_roi_db;
CREATE DATABASE merger_roi_db;
-- Then run schema.sql and seed_data.sql again
```

---

## Performance Tips

### Indexes Already Created:
- firm_name, industry on firm table
- firm_id, department, role on staff table
- firm_id, sale_date, territory, product_id on sales table

### Query Optimization:
- Use the provided views for common queries
- Filter by indexed columns when possible
- Use date ranges for sales queries

### Example Optimized Queries:
```sql
-- Get firm summary (uses view)
SELECT * FROM v_firm_summary WHERE firm_id = 1;

-- Get monthly sales (uses view)
SELECT * FROM v_monthly_sales WHERE firm_id = 1 ORDER BY period DESC;

-- Get recent sales (uses index)
SELECT * FROM sales 
WHERE firm_id = 1 
  AND sale_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
ORDER BY sale_date DESC;
```

---

## Troubleshooting

### "Table doesn't exist"
- Make sure you ran schema.sql first
- Check you're using the correct database: `USE merger_roi_db;`

### "Foreign key constraint fails"
- Ensure firm exists before adding staff or sales
- Check firm_id values match

### "Access denied"
- Verify MySQL user has proper permissions
- Grant permissions: `GRANT ALL ON merger_roi_db.* TO 'user'@'localhost';`

### "Connection refused"
- Check MySQL is running: `systemctl status mysql` (Linux)
- Verify port 3306 is open
- Check firewall settings

---

## Backup and Restore

### Backup
```bash
mysqldump -u root -p merger_roi_db > backup.sql
```

### Restore
```bash
mysql -u root -p merger_roi_db < backup.sql
```

---

## Production Considerations

For production deployment:

1. **Change default passwords**
2. **Create dedicated database user** (not root)
3. **Enable SSL connections**
4. **Set up regular backups**
5. **Monitor query performance**
6. **Configure connection pooling**
7. **Set up replication** (if needed)

Example production user:
```sql
CREATE USER 'merger_app'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON merger_roi_db.* TO 'merger_app'@'%';
FLUSH PRIVILEGES;
```

---

## Need Help?

- Check application logs: `docker-compose logs database`
- Verify connection: `mysql -h localhost -u root -p`
- Test queries in MySQL Workbench or similar tool
- Review error messages in backend logs
