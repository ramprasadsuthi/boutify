-- MySQL Schema for Genealogy Connect

CREATE DATABASE IF NOT EXISTS genealogy_connect;
USE genealogy_connect;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'boutique_owner', 'customer') NOT NULL DEFAULT 'customer',
    status ENUM('active', 'pending', 'restricted') NOT NULL DEFAULT 'pending',
    referral_code VARCHAR(10) UNIQUE,
    referred_by VARCHAR(36),
    boutique_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Index for faster referral lookups
CREATE INDEX idx_referral_code ON users(referral_code);
