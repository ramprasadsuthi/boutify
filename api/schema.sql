-- MySQL Schema for Genealogy Connect

CREATE DATABASE IF NOT EXISTS genealogy_connect;
USE genealogy_connect;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    userid VARCHAR(50) UNIQUE,
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

-- Index for faster referral lookups (Safe creation)
SET @dbname = DATABASE();
SET @tablename = "users";
SET @indexname = "idx_referral_code";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE \`table_schema\` = @dbname
    AND \`table_name\` = @tablename
    AND \`index_name\` = @indexname
  ) > 0,
  "SELECT 1",
  CONCAT("CREATE INDEX ", @indexname, " ON ", @tablename, "(referral_code);")
));
PREPARE createIfNotExists FROM @preparedStatement;
EXECUTE createIfNotExists;
DEALLOCATE PREPARE createIfNotExists;

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

-- Extended Boutique Details
CREATE TABLE IF NOT EXISTS boutique_details (
    boutique_id VARCHAR(36) PRIMARY KEY,
    alternate_mobile VARCHAR(20),
    website VARCHAR(255),
    gst_number VARCHAR(50),
    registration_number VARCHAR(50),
    year_established YEAR,
    state VARCHAR(100),
    district VARCHAR(100),
    full_address TEXT,
    landmark VARCHAR(255),
    pincode VARCHAR(10),
    google_maps_link TEXT,
    working_days VARCHAR(100),
    opening_time TIME,
    closing_time TIME,
    weekly_holiday VARCHAR(50),
    blouse_starting_price DECIMAL(10,2),
    saree_fall_pico_charges DECIMAL(10,2),
    bridal_package_cost DECIMAL(10,2),
    designer_dress_cost DECIMAL(10,2),
    alteration_charges DECIMAL(10,2),
    home_visit_charges DECIMAL(10,2),
    instagram_url TEXT,
    facebook_url TEXT,
    youtube_channel TEXT,
    whatsapp_number VARCHAR(20),
    telegram_link TEXT,
    FOREIGN KEY (boutique_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Boutique Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS boutique_categories (
    boutique_id VARCHAR(36) NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (boutique_id, category_id),
    FOREIGN KEY (boutique_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Boutique Services (Predefined List)
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS boutique_offered_services (
    boutique_id VARCHAR(36) NOT NULL,
    service_id INT NOT NULL,
    PRIMARY KEY (boutique_id, service_id),
    FOREIGN KEY (boutique_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Boutique Products
CREATE TABLE IF NOT EXISTS boutique_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    boutique_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price_range VARCHAR(100),
    description TEXT,
    material VARCHAR(100),
    available_sizes VARCHAR(255),
    images TEXT, -- JSON array of URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (boutique_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Boutique Profile Images
CREATE TABLE IF NOT EXISTS boutique_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    boutique_id VARCHAR(36) NOT NULL,
    image_type ENUM('logo', 'shop_front', 'interior', 'trial_room', 'sample_design', 'bridal_collection', 'team', 'video_tour') NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (boutique_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Boutique custom services Table
CREATE TABLE IF NOT EXISTS boutique_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    boutique_id VARCHAR(36) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    charge DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (boutique_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Data for Categories
INSERT IGNORE INTO categories (id, name) VALUES 
(1, 'Women\'s Boutique'), (2, 'Men\'s Boutique'), (3, 'Kids Wear'), (4, 'Bridal Boutique'), 
(5, 'Designer Boutique'), (6, 'Ethnic Wear'), (7, 'Fashion Studio'), (8, 'Tailoring Services'), 
(9, 'Custom Design Studio'), (10, 'Saree Boutique'), (11, 'Blouse Specialist'), (12, 'Lehenga Specialist');

-- Seed Data for Services
INSERT IGNORE INTO services (id, name) VALUES 
(1, 'Stitching'), (2, 'Alterations'), (3, 'Bridal Wear Design'), (4, 'Blouse Designing'), 
(5, 'Embroidery Work'), (6, 'Aari Work'), (7, 'Maggam Work'), (8, 'Handwork'), 
(9, 'Designer Dresses'), (10, 'Custom Tailoring'), (11, 'Uniform Stitching'), 
(12, 'Boutique Consultation'), (13, 'Home Measurement'), (14, 'Online Orders'), (15, 'Door Delivery');
