# Genealogy Connect - Project Brief

Genealogy Connect is a modern full-stack web application designed for managing and visualizing hierarchical referral networks. It provides businesses with tools to track customer growth, manage memberships, and visualize complex referral structures through interactive diagrams.

## 🚀 Core Tech Stack

- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) with [TanStack Router](https://tanstack.com/router) for type-safe routing.
- **Backend:** [Hono](https://hono.dev/) on [Cloudflare Workers](https://workers.cloudflare.com/) for a lightweight, global API.
- **Database:** [MySQL](https://www.mysql.com/) for relational data management and referral tracking.
- **Visualization:** [@xyflow/react](https://reactflow.dev/) (React Flow) for interactive genealogy trees and [Recharts](https://recharts.org/) for data analytics.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) (shadcn/ui) for a high-performance, accessible, and modern UI.
- **Form Management:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation.

## ✨ Key Features

- **Interactive Genealogy Mapping:** Dynamic visualization of referral hierarchies with zoom, pan, and mini-map support.
- **Member Management:** Comprehensive dashboard for tracking customer statuses (`active`, `pending`, `inactive`) and referral metrics.
- **Boutique Operations:** Tools for managing shop-specific data and boutique-level networking.
- **Secure Authentication:** Custom JWT-based authentication integrated with MySQL.
- **Responsive Design:** Polished, mobile-first interface with elegant transitions and modern aesthetics.

## 📂 Project Structure

- `src/routes/`: File-based routing for the dashboard, network tree, and settings.
- `src/components/app/`: Core feature components (e.g., `GenealogyTree`, `AppShell`).
- `src/components/ui/`: Atomic, reusable UI components.
- `api/src/`: Hono API source code for Cloudflare Workers.
- `api/schema.sql`: MySQL database schema.
- `api/direct_server.mjs`: Optional Express-based direct MySQL server for local development.

## 🛠️ Getting Started

1. **Install Dependencies:** `npm install` in both root and `api/` directories.
2. **Setup Database:** Run `api/schema.sql` on your MySQL server.
3. **Configure Environment:** See `MIGRATION_GUIDE.md` for API and frontend configuration.
4. **Run Development:** Start the API in `api/` and the frontend in the root.

