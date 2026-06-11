<div align="center">

<img src="https://res.cloudinary.com/debw95rak/image/upload/Screenshot_20260611_122241_uex8wu" width="100%" alt="Profile" />

# HoodVault

**Premium hoodie e-commerce platform — built end to end with Node.js, React, and MongoDB**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-a855f7?style=flat-square)](LICENSE)

</div>

---

## ✦ Overview

HoodVault is a full-stack hoodie store with a customer-facing storefront, a dedicated admin dashboard, and a secure Express REST API. Orders are handled via a Telegram integration — no payment gateway needed. Designed for Ethiopian birr (ETB) pricing, dark/light theming, and mobile-first layouts.

```
Customer browses → adds to cart → sends order via Telegram → admin updates status from dashboard
```

---

## 🗂 Project Layout

```
hoodie-store/
├── backend/        Node.js + Express API (ESM)
├── frontend/       Customer storefront  — React 18 + Vite + TypeScript
└── admin/          Admin panel          — React 18 + Vite + TypeScript
```

---

## ⚡ Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| MongoDB | local or Atlas |
| Cloudinary | account |
| EmailJS | account |

### 1 — Install everything

```bash
npm run install:all
# or individually:
cd backend  && npm install
cd frontend && npm install
cd admin    && npm install
```

### 2 — Configure environment

**Backend** (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

MONGODB_URI=mongodb://localhost:27017/hoodie-store

JWT_SECRET=your_32+_char_secret_here
JWT_REFRESH_SECRET=your_32+_char_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
EMAILJS_TEMPLATE_OTP=template_xxxxxxx

TELEGRAM_USERNAME=your_telegram_handle

SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_USERNAME=superadmin
# Set once to seed the first super admin, then remove:
# SUPER_ADMIN_EMAIL=
# SUPER_ADMIN_PASSWORD=
```

**Frontend** (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_TELEGRAM_USERNAME=your_telegram_handle
VITE_ADMIN_URL=http://localhost:5174
```

**Admin** (`admin/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STORE_URL=http://localhost:5173
```

### 3 — Seed the database

```bash
cd backend
npm run seed
# Creates the super admin account + 3 sample hoodies
```

### 4 — Run dev servers

```bash
npm run dev:backend   # → http://localhost:5000
npm run dev:frontend  # → http://localhost:5173
npm run dev:admin     # → http://localhost:5174
```

> **Admin credentials** are set via `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in `.env`. After the first seed, remove those keys and manage credentials from the admin settings page.

---

## 🛒 Order Flow

```
Customer adds items to cart
        ↓
Clicks "Order via Telegram"
        ↓
Telegram opens with pre-filled message:

  Hello! I would like to order from HoodVault:

  • Urban Shadow Oversized Hoodie
    Size: L | Color: Midnight Black
    Qty: 2 × ETB 1,999 = ETB 3,998

  💰 Total: ETB 3,998

  Please provide delivery information.
        ↓
Admin receives order → creates record → updates status from dashboard
```

---

## 🔒 Security

| Area | Implementation |
|------|----------------|
| Passwords | bcrypt · salt factor 12 |
| Tokens | JWT access (15 min) + refresh (7 days) with rotation |
| Brute force | Account lockout after 5 failed logins (30 min) |
| Email | OTP verification · single-use reset tokens (15 min) |
| API | Helmet headers · CORS whitelist · rate limiting · input validation |
| Database | MongoDB sanitization (NoSQL injection prevention) |
| Files | MIME type check · 5 MB product / 2 MB avatar limits · Cloudinary storage |
| Cookies | HTTP-only, secure |
| Roles | `customer` → shop · `admin` → management · `superadmin` → everything + audit logs |
| Logging | Winston (error + combined) · security event trail |

---

## 🗄 Data Collections

| Collection | Purpose |
|------------|---------|
| `users` | Customers + admins |
| `hoodies` | Product catalog |
| `orders` | Order records |
| `securitylogs` | Audit trail |

---

## ☁️ Deployment

### Backend — Railway / Render / VPS

```bash
NODE_ENV=production
FRONTEND_URL=https://your-store.vercel.app
# Use MongoDB Atlas connection string
npm start
```

### Frontend & Admin — Vercel / Netlify

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output directory | `dist` |
| `VITE_ADMIN_URL` | `https://your-admin.vercel.app` |
| `VITE_STORE_URL` | `https://your-store.vercel.app` |

> On Vercel, leave `VITE_API_URL` unset — `vercel.json` proxies `/api/*` to the backend. Do **not** point `VITE_API_URL` directly at a Render URL without reworking CSRF/cookie settings.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| UI & Motion | Radix UI, Framer Motion, Recharts |
| State | Zustand (cart) · React Context (auth / theme) |
| Backend | Node.js, Express.js (ESM) |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh), bcryptjs |
| Storage | Cloudinary |
| Email | EmailJS |
| Security | Helmet, express-mongo-sanitize, express-rate-limit |
| Logging | Winston |

---

## 📱 Feature Highlights

<table>
<tr>
<td width="50%" valign="top">

**Storefront**
- Hero section with featured products
- Shop with category filters, sort, pagination
- Product detail — image gallery, size & color picker
- Cart with quantity management
- Telegram order integration
- Light / Dark mode
- Fully mobile responsive

</td>
<td width="50%" valign="top">

**Admin Panel**
- Dashboard — revenue charts, order status, categories
- Product CRUD with multi-image upload
- Order management with status updates
- Customer list
- Admin user management *(super admin only)*
- Security audit logs *(super admin only)*
- Profile settings, password change, avatar upload

</td>
</tr>
</table>

---

## 📧 Email Templates

- **Account verification** — OTP, 15-min expiry
- **Password reset** — single-use token, 15-min expiry
- **Order confirmation** — itemized order summary

---

<div align="center">

Made with ☕ · PRs welcome · [Open an issue](#)

</div>
