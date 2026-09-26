-- ============================================================
-- Salary and Expense Tracker - Fresh Database Setup
-- Run this in MySQL Workbench (Salary and Expense Tracker connection)
-- ============================================================

-- Create brand new database (nothing to do with paysplit_db)
CREATE DATABASE IF NOT EXISTS salary_expense_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Verify
SHOW DATABASES LIKE 'salary_expense_db';

-- Switch to it
USE salary_expense_db;

SELECT 'salary_expense_db is ready!' AS Status;
