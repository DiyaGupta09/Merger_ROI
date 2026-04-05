"""One-shot Railway DB seeder"""
import pymysql

conn = pymysql.connect(
    host='junction.proxy.rlwy.net',
    port=35299,
    user='root',
    password='fqPjOApiSFGaVawhdnkdzTKQhWQcSHto',
    database='railway',
    charset='utf8mb4',
    autocommit=True
)

statements = [
# Drop
"DROP TABLE IF EXISTS sales",
"DROP TABLE IF EXISTS staff",
"DROP TABLE IF EXISTS firm",
"DROP TABLE IF EXISTS roi_timeseries",
"DROP TABLE IF EXISTS department_budgets",
"DROP TABLE IF EXISTS simulation_results",
"DROP TABLE IF EXISTS ai_insights",

# Firm
"""CREATE TABLE firm (
    firm_id INT PRIMARY KEY AUTO_INCREMENT,
    firm_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    founded_year INT,
    total_capital DECIMAL(15,2) DEFAULT 0,
    headquarters VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4""",

# Staff
"""CREATE TABLE staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(12,2) NOT NULL DEFAULT 0,
    performance_score DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firm_id) REFERENCES firm(firm_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4""",

# Sales
"""CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(255),
    sale_date DATE NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    territory VARCHAR(100),
    customer_segment VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firm_id) REFERENCES firm(firm_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4""",

# Firms data
"""INSERT INTO firm (firm_name, industry, founded_year, total_capital, headquarters) VALUES
('TechVision Inc','Technology',2015,5000000.00,'San Francisco, CA'),
('DataFlow Systems','Technology',2018,3500000.00,'Austin, TX'),
('CloudNet Solutions','Technology',2017,4200000.00,'Seattle, WA'),
('FinanceHub Corp','Finance',2012,8000000.00,'New York, NY'),
('RetailMax Group','Retail',2010,6500000.00,'Chicago, IL'),
('HealthCare Plus','Healthcare',2014,7200000.00,'Boston, MA'),
('EduTech Learning','Education',2019,2800000.00,'Denver, CO'),
('GreenEnergy Co','Energy',2011,9500000.00,'Houston, TX'),
('LogiTrans Inc','Logistics',2016,5500000.00,'Atlanta, GA'),
('MediaWorks Studio','Media',2020,3200000.00,'Los Angeles, CA')""",

# Staff data
"""INSERT INTO staff (firm_id,name,role,department,hire_date,salary,performance_score) VALUES
(1,'John Smith','CEO','Executive','2015-01-15',180000,0.95),
(1,'Sarah Johnson','CTO','Technology','2015-03-20',160000,0.92),
(1,'Mike Chen','VP Engineering','Technology','2016-06-10',140000,0.88),
(1,'Emily Davis','Senior Developer','Technology','2017-02-14',120000,0.90),
(1,'Robert Wilson','Product Manager','Product','2018-05-22',110000,0.85),
(2,'Lisa Anderson','CEO','Executive','2018-01-10',170000,0.93),
(2,'David Martinez','VP Sales','Sales','2018-04-15',130000,0.89),
(2,'Jennifer Lee','Data Scientist','Analytics','2019-03-20',115000,0.91),
(2,'Thomas Brown','Developer','Technology','2019-07-01',95000,0.87),
(3,'Amanda White','CEO','Executive','2017-02-01',175000,0.94),
(3,'Kevin Taylor','VP Operations','Operations','2017-05-10',135000,0.90),
(3,'Rachel Green','Cloud Architect','Technology','2018-08-15',125000,0.92),
(3,'Chris Moore','DevOps Engineer','Technology','2019-01-20',105000,0.88),
(4,'William Harris','CEO','Executive','2012-03-01',230000,0.96),
(4,'Patricia Clark','CFO','Finance','2012-06-15',200000,0.94),
(4,'James Lewis','VP Risk Management','Risk','2013-09-10',150000,0.91),
(4,'Maria Rodriguez','Senior Analyst','Analytics','2015-02-20',110000,0.89),
(4,'Daniel Walker','Compliance Officer','Legal','2016-11-05',120000,0.87),
(5,'Barbara Hall','CEO','Executive','2010-01-15',190000,0.93),
(5,'Richard Allen','VP Retail Operations','Operations','2011-04-20',140000,0.90),
(5,'Susan Young','Store Manager','Retail','2012-07-10',85000,0.88),
(5,'Joseph King','Supply Chain Manager','Logistics','2014-03-15',95000,0.86),
(6,'Dr. Elizabeth Wright','CEO','Executive','2014-02-01',210000,0.95),
(6,'Dr. Michael Scott','Chief Medical Officer','Medical','2014-05-10',195000,0.93),
(6,'Nancy Adams','VP Patient Services','Operations','2015-08-20',135000,0.91),
(6,'Paul Baker','IT Director','Technology','2016-11-15',115000,0.89),
(7,'Laura Nelson','CEO','Executive','2019-01-10',150000,0.92),
(7,'Steven Carter','VP Product','Product','2019-03-15',125000,0.90),
(7,'Michelle Mitchell','Content Director','Content','2019-06-20',95000,0.88),
(7,'Brian Perez','Developer','Technology','2020-02-01',85000,0.86),
(8,'George Roberts','CEO','Executive','2011-04-01',220000,0.96),
(8,'Karen Turner','VP Engineering','Engineering','2011-07-15',165000,0.94),
(8,'Edward Phillips','Project Manager','Operations','2013-10-20',120000,0.90),
(8,'Dorothy Campbell','Environmental Analyst','Research','2015-05-10',100000,0.88),
(9,'Charles Parker','CEO','Executive','2016-03-01',185000,0.93),
(9,'Betty Evans','VP Logistics','Operations','2016-06-10',145000,0.91),
(9,'Frank Edwards','Fleet Manager','Operations','2017-09-15',95000,0.87),
(9,'Helen Collins','Route Optimizer','Analytics','2018-12-01',90000,0.89),
(10,'Anthony Stewart','CEO','Executive','2020-01-15',165000,0.92),
(10,'Carol Morris','Creative Director','Creative','2020-03-20',125000,0.90),
(10,'Gary Rogers','Producer','Production','2020-06-10',95000,0.88),
(10,'Donna Reed','Marketing Manager','Marketing','2020-09-01',85000,0.86)""",

# Sales data
"""INSERT INTO sales (firm_id,product_id,product_name,sale_date,quantity,unit_price,total_amount,territory,customer_segment) VALUES
(1,101,'Cloud Platform License',DATE_SUB(CURDATE(),INTERVAL 90 DAY),5,50000,250000,'West','Enterprise'),
(1,102,'AI Analytics Suite',DATE_SUB(CURDATE(),INTERVAL 60 DAY),3,75000,225000,'West','Enterprise'),
(1,101,'Cloud Platform License',DATE_SUB(CURDATE(),INTERVAL 30 DAY),8,50000,400000,'East','Mid-Market'),
(1,103,'Data Integration Tool',DATE_SUB(CURDATE(),INTERVAL 15 DAY),12,25000,300000,'Central','Mid-Market'),
(1,102,'AI Analytics Suite',DATE_SUB(CURDATE(),INTERVAL 5 DAY),4,75000,300000,'West','Enterprise'),
(2,201,'Data Pipeline Software',DATE_SUB(CURDATE(),INTERVAL 85 DAY),6,40000,240000,'Central','Enterprise'),
(2,202,'ETL Tool',DATE_SUB(CURDATE(),INTERVAL 55 DAY),10,15000,150000,'East','Mid-Market'),
(2,201,'Data Pipeline Software',DATE_SUB(CURDATE(),INTERVAL 25 DAY),4,40000,160000,'West','Enterprise'),
(2,203,'Data Quality Suite',DATE_SUB(CURDATE(),INTERVAL 12 DAY),8,20000,160000,'Central','Mid-Market'),
(2,202,'ETL Tool',DATE_SUB(CURDATE(),INTERVAL 2 DAY),15,15000,225000,'East','SMB'),
(3,301,'Cloud Infrastructure',DATE_SUB(CURDATE(),INTERVAL 95 DAY),7,60000,420000,'West','Enterprise'),
(3,302,'Security Suite',DATE_SUB(CURDATE(),INTERVAL 65 DAY),5,45000,225000,'East','Enterprise'),
(3,301,'Cloud Infrastructure',DATE_SUB(CURDATE(),INTERVAL 35 DAY),9,60000,540000,'Central','Enterprise'),
(3,303,'Monitoring Tools',DATE_SUB(CURDATE(),INTERVAL 18 DAY),12,18000,216000,'West','Mid-Market'),
(3,302,'Security Suite',DATE_SUB(CURDATE(),INTERVAL 8 DAY),6,45000,270000,'East','Enterprise'),
(4,401,'Trading Platform',DATE_SUB(CURDATE(),INTERVAL 100 DAY),3,150000,450000,'East','Enterprise'),
(4,402,'Risk Analytics',DATE_SUB(CURDATE(),INTERVAL 70 DAY),5,80000,400000,'East','Enterprise'),
(4,403,'Compliance Software',DATE_SUB(CURDATE(),INTERVAL 40 DAY),8,55000,440000,'Central','Mid-Market'),
(4,401,'Trading Platform',DATE_SUB(CURDATE(),INTERVAL 20 DAY),4,150000,600000,'West','Enterprise'),
(4,402,'Risk Analytics',DATE_SUB(CURDATE(),INTERVAL 10 DAY),6,80000,480000,'East','Enterprise'),
(5,501,'POS System',DATE_SUB(CURDATE(),INTERVAL 110 DAY),20,8000,160000,'Central','SMB'),
(5,502,'Inventory Management',DATE_SUB(CURDATE(),INTERVAL 80 DAY),15,12000,180000,'East','Mid-Market'),
(5,503,'Customer Loyalty Platform',DATE_SUB(CURDATE(),INTERVAL 50 DAY),10,15000,150000,'West','Mid-Market'),
(5,501,'POS System',DATE_SUB(CURDATE(),INTERVAL 30 DAY),25,8000,200000,'South','SMB'),
(5,502,'Inventory Management',DATE_SUB(CURDATE(),INTERVAL 15 DAY),18,12000,216000,'Central','Mid-Market'),
(6,601,'EMR System',DATE_SUB(CURDATE(),INTERVAL 120 DAY),4,120000,480000,'East','Enterprise'),
(6,602,'Patient Portal',DATE_SUB(CURDATE(),INTERVAL 90 DAY),8,35000,280000,'Central','Mid-Market'),
(6,603,'Telemedicine Platform',DATE_SUB(CURDATE(),INTERVAL 60 DAY),6,50000,300000,'West','Mid-Market'),
(6,601,'EMR System',DATE_SUB(CURDATE(),INTERVAL 30 DAY),5,120000,600000,'East','Enterprise'),
(6,602,'Patient Portal',DATE_SUB(CURDATE(),INTERVAL 10 DAY),10,35000,350000,'South','Mid-Market'),
(7,701,'LMS Platform',DATE_SUB(CURDATE(),INTERVAL 130 DAY),12,25000,300000,'Central','Mid-Market'),
(7,702,'Course Creation Tool',DATE_SUB(CURDATE(),INTERVAL 100 DAY),20,8000,160000,'East','SMB'),
(7,703,'Student Analytics',DATE_SUB(CURDATE(),INTERVAL 70 DAY),15,12000,180000,'West','Mid-Market'),
(7,701,'LMS Platform',DATE_SUB(CURDATE(),INTERVAL 40 DAY),10,25000,250000,'South','Mid-Market'),
(7,702,'Course Creation Tool',DATE_SUB(CURDATE(),INTERVAL 15 DAY),25,8000,200000,'Central','SMB'),
(8,801,'Solar Panel Installation',DATE_SUB(CURDATE(),INTERVAL 140 DAY),8,180000,1440000,'West','Enterprise'),
(8,802,'Energy Management System',DATE_SUB(CURDATE(),INTERVAL 110 DAY),5,95000,475000,'Central','Enterprise'),
(8,803,'Battery Storage',DATE_SUB(CURDATE(),INTERVAL 80 DAY),6,120000,720000,'South','Enterprise'),
(8,801,'Solar Panel Installation',DATE_SUB(CURDATE(),INTERVAL 50 DAY),10,180000,1800000,'West','Enterprise'),
(8,802,'Energy Management System',DATE_SUB(CURDATE(),INTERVAL 20 DAY),7,95000,665000,'East','Enterprise'),
(9,901,'Fleet Management Software',DATE_SUB(CURDATE(),INTERVAL 150 DAY),10,45000,450000,'Central','Mid-Market'),
(9,902,'Route Optimization',DATE_SUB(CURDATE(),INTERVAL 120 DAY),15,28000,420000,'East','Mid-Market'),
(9,903,'Warehouse Management',DATE_SUB(CURDATE(),INTERVAL 90 DAY),8,55000,440000,'West','Enterprise'),
(9,901,'Fleet Management Software',DATE_SUB(CURDATE(),INTERVAL 60 DAY),12,45000,540000,'South','Mid-Market'),
(9,902,'Route Optimization',DATE_SUB(CURDATE(),INTERVAL 30 DAY),18,28000,504000,'Central','Mid-Market'),
(10,1001,'Video Production Service',DATE_SUB(CURDATE(),INTERVAL 160 DAY),5,75000,375000,'West','Enterprise'),
(10,1002,'Animation Package',DATE_SUB(CURDATE(),INTERVAL 130 DAY),8,45000,360000,'East','Mid-Market'),
(10,1003,'Marketing Campaign',DATE_SUB(CURDATE(),INTERVAL 100 DAY),6,60000,360000,'Central','Mid-Market'),
(10,1001,'Video Production Service',DATE_SUB(CURDATE(),INTERVAL 70 DAY),7,75000,525000,'West','Enterprise'),
(10,1002,'Animation Package',DATE_SUB(CURDATE(),INTERVAL 40 DAY),10,45000,450000,'South','Mid-Market')""",

# AI tables
"""CREATE TABLE IF NOT EXISTS roi_timeseries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT NOT NULL,
    timestamp DATE NOT NULL,
    roi DECIMAL(10,4),
    equity DECIMAL(15,2),
    task_count INT DEFAULT 0,
    budget_allocated DECIMAL(15,2) DEFAULT 0,
    cash_flow DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firm_id) REFERENCES firm(firm_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4""",

"""CREATE TABLE IF NOT EXISTS department_budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    allocated_budget DECIMAL(15,2) DEFAULT 0,
    spent_budget DECIMAL(15,2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firm_id) REFERENCES firm(firm_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4""",

"""CREATE TABLE IF NOT EXISTS simulation_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT,
    simulation_type VARCHAR(50) DEFAULT 'rl_vs_current',
    current_roi DECIMAL(10,4),
    optimized_roi DECIMAL(10,4),
    improvement_pct DECIMAL(8,4),
    recommendations JSON,
    decision_trace JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4""",

"""CREATE TABLE IF NOT EXISTS ai_insights (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firm_id INT,
    insight_type VARCHAR(50),
    content TEXT,
    feature_importance JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4""",

# Seed roi_timeseries
"""INSERT INTO roi_timeseries (firm_id, timestamp, roi, equity, task_count, budget_allocated, cash_flow)
SELECT s.firm_id,
    DATE_FORMAT(s.sale_date,'%Y-%m-01') as timestamp,
    ROUND((SUM(s.total_amount)-COALESCE(st.total_salary,0))/NULLIF(COALESCE(st.total_salary,0),0)*100,4) as roi,
    f.total_capital,
    COUNT(s.sale_id),
    COALESCE(st.total_salary,0)*1.2,
    SUM(s.total_amount)-COALESCE(st.total_salary,0)
FROM sales s
JOIN firm f ON s.firm_id=f.firm_id
LEFT JOIN (SELECT firm_id,SUM(salary)/12 as total_salary FROM staff GROUP BY firm_id) st ON st.firm_id=s.firm_id
GROUP BY s.firm_id,DATE_FORMAT(s.sale_date,'%Y-%m-01'),f.total_capital,st.total_salary""",

# Seed department_budgets
"""INSERT INTO department_budgets (firm_id,department,allocated_budget,spent_budget,period_start,period_end)
SELECT firm_id,department,SUM(salary)*1.3,SUM(salary),'2024-01-01','2024-12-31'
FROM staff GROUP BY firm_id,department""",
]

with conn.cursor() as cursor:
    for i, stmt in enumerate(statements):
        try:
            cursor.execute(stmt)
        except Exception as e:
            print(f"  [{i}] Warning: {str(e)[:100]}")

    cursor.execute("SHOW TABLES")
    tables = [t[0] for t in cursor.fetchall()]
    print(f"Tables: {tables}")
    for t in ['firm','staff','sales','roi_timeseries','department_budgets']:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            print(f"  {t}: {cursor.fetchone()[0]} rows")
        except: pass

conn.close()
print("Done!")
