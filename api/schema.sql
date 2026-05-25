-- MySQL Schema for Genealogy Connect

CREATE DATABASE IF NOT EXISTS genealogy_connect;
USE genealogy_connect;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    mobile VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'boutique_owner', 'customer') NOT NULL DEFAULT 'customer',
    status ENUM('active', 'pending', 'restricted') NOT NULL DEFAULT 'pending',
    referral_code VARCHAR(10) UNIQUE,
    referred_by VARCHAR(36),
    boutique_name VARCHAR(255),
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    city VARCHAR(100),
    area VARCHAR(100),
    boutique_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Index for faster referral lookups
CREATE INDEX idx_referral_code ON users(referral_code);

-- Transactions table for wallet credits/debits
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('credit', 'debit') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Boutique Services Table
CREATE TABLE IF NOT EXISTS boutique_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    boutique_id VARCHAR(36) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    charge DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (boutique_id) REFERENCES users(id) ON DELETE CASCADE
);