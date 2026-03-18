# FinStreet

FinStreet is a full-stack personal finance app built to help you manage day-to-day money in one place. It combines expense tracking, category-based budgeting, recurring monthly expenses, statement import, main-account credit tracking, and downloadable reports in a clean React + Node.js workflow.

## What FinStreet Includes

- JWT-based user authentication
- Manual expense tracking with shared category names
- `Spent At / Paid To` support for cleaner expense history
- Monthly recurring expenses with auto-fill
- Category budgets with progress bars, insights, and alerts
- Paytm passbook Excel import using SheetJS
- Main account balance and received-money history
- Dashboard summaries for savings and expense trends
- CSV and PDF export for expenses, budgets, and imported statement reports
- Extra finance modules for investments, events, and learning pages

## Core Experience

### Expenses

- Add expenses manually with category, amount, date, and merchant/person name
- Search and filter expense history by text, category, and date range
- Edit and delete expenses
- Mark expenses as monthly recurring
- Auto-generated recurring entries are created for future months

### Budget

- Create monthly budgets per category
- Keep category names aligned with expenses and imports
- View progress bars and spending pressure per category
- Get alerts such as:
  - `80% of Food budget used`
  - `Travel budget exceeded by ₹1200`

### Paytm Import

- Upload `.xlsx` or `.xls` files from the Expenses page
- Reads the `Passbook Payment History` sheet
- Paid entries are added to expenses
- Received entries are added to the main account
- Duplicate statement rows are skipped safely

### Main Account

- Tracks received money separately from expenses
- Stores main account balance
- Shows searchable credit history with account, UPI ref, remarks, and source details

### Reports

- Export filtered expenses as CSV or PDF
- Export budget summaries as CSV or PDF
- Export the latest imported Paytm statement report as CSV or PDF

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT
- File import: Multer, SheetJS (`xlsx`)
- Report export: `jspdf`, `jspdf-autotable`

## Project Structure

```text
FinStreet/
  Backend/
    public/
      imports/
    scripts/
    src/
      constants/
      controller/
      middleware/
      models/
      routes/
      utills/
  Frontend/
    src/
      componants/
      constants/
      context/
      pages/
  .gitignore
  README.md
```

Note:
- The existing folder names `utills` and `componants` are intentionally kept to match the current project structure.

## Quick Start

### 1. Prerequisites

- Node.js 20+
- MongoDB running locally or a reachable MongoDB connection string

### 2. Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 3. Configure environment files

Create these files from the provided examples:

- `Backend/.env`
- `Frontend/.env`

Backend example:

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/finstreet
CORS_ORIGIN=http://localhost:5173
REFRESH_TOKEN_SECRET=replace_with_a_secure_secret
REFRESH_TOKEN_EXPIRY=7d
```

Frontend example:

```env
VITE_BASE_URL=http://localhost:8000
```

### 4. Run the backend

```bash
cd Backend
npm run dev
```

### 5. Run the frontend

```bash
cd Frontend
npm run dev
```

Frontend default local URL:
- `http://localhost:5173`

## Scripts

### Backend

```bash
npm run dev
npm start
npm run import:paytm-passbook
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

## Main Routes

### Frontend Pages

- `/`
- `/dashboard`
- `/expenses`
- `/budget`
- `/main-account`
- `/events`
- `/investments`
- `/learn`
- `/profile`
- `/signin`
- `/signup`

### Backend API Areas

- `/api/v1/users`
- `/api/v1/expenses`
- `/api/v1/budgets`
- `/api/v1/events`
- `/api/v1/investments`
- `/api/v1/advice`

## Recommended Demo Flow

1. Sign up and log in.
2. Create a few category budgets.
3. Add a manual expense with `Spent At / Paid To`.
4. Mark one monthly expense like rent or recharge as recurring.
5. Upload a Paytm passbook Excel file from the Expenses page.
6. Review imported paid entries in Expenses and received entries in Main Account.
7. Check Budget alerts and Dashboard savings.
8. Export a CSV or PDF report.

## Git and Repo Notes

- Generated import files inside `Backend/public/imports/` are ignored from Git.
- Local `.env` files are ignored.
- Build output, logs, caches, and editor-specific files are ignored.
- The folder itself is kept using `.gitkeep` where needed.

## Author

Neeraj
