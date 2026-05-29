# Genealogy Connect - Migration to MySQL & Cloudflare

The project has been migrated from Firebase to a custom MySQL + Cloudflare Workers API architecture.

## 🚀 Getting Started

### 1. MySQL Setup (Local)
You need to have MySQL installed on your machine.
1. Run the schema found in `api/schema.sql` on your local MySQL server.
2. The schema creates a database named `genealogy_connect`.

### 2. Backend API (Cloudflare Workers)
The API is located in the `api/` directory.
1. Open a terminal in the `api/` folder.
2. Run `npm install`.
3. Configure your database credentials in `api/wrangler.toml` (DB_USER, DB_PASSWORD, etc.).
4. Run the API locally:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:8787`.

### 3. Frontend App
1. Run `npm install` in the root directory.
2. Run the app:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`.

## ✨ Fixed Features
- **Admin User Management:** View, search, and delete any user profile.
- **Referral System:** Generates unique codes and tracks parent referrals in MySQL.
- **Share Link:** Fixed the referral link formatting to ensure it auto-populates correctly on registration.
- **Auth:** Migrated to custom JWT-based authentication.

## ⚠️ Important
Make sure both the **API** and the **Frontend** are running simultaneously for the app to function correctly.
