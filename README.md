# HoodVault — Premium Hoodie Store
## Complete Setup & Deployment Guide

---

## 📁 Project Structure

```
hoodie-store/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/             # DB, Cloudinary config
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, rate limit, error handling
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # Express routes
│   │   └── utils/              # Logger, email, JWT, seeder
│   ├── logs/                   # Auto-created log files
│   └── package.json
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── admin/          # Admin layout + sidebar
│   │   │   └── customer/       # Navbar, Footer, ProductCard
│   │   ├── contexts/           # Auth, Theme, Cart (Zustand)
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, Products, Orders...
│   │   │   └── customer/       # Home, Shop, Cart, Login...
│   │   ├── services/           # Axios API client
│   │   └── types/              # TypeScript interfaces
│   └── package.json
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail / SMTP credentials

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all

# Or separately:
cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your actual values
```

Required `.env` values:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/hoodie-store
JWT_SECRET=your_32+_char_secret_here
JWT_REFRESH_SECRET=your_32+_char_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=HoodVault
SMTP_FROM_EMAIL=noreply@hoodvault.com
TELEGRAM_USERNAME=your_telegram_handle
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_EMAIL=superadmin@hoodvault.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123
```

### 3. Frontend Environment

```bash
cd frontend
cp .env.example .env.local
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_TELEGRAM_USERNAME=your_telegram_handle
```

### 4. Seed Database

```bash
cd backend
npm run seed
```

This creates:
- Super Admin account (credentials from `.env`)
- 3 sample hoodies

### 5. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:5173/admin

---

## 🔑 Default Admin Credentials

After seeding:
- **Email:** superadmin@hoodvault.com
- **Password:** SuperAdmin@123

> ⚠️ Change these immediately after first login!

---

## ☁️ Production Deployment

### Backend — Railway / Render / VPS

1. Set all environment variables on your platform
2. Change `NODE_ENV=production`
3. Update `FRONTEND_URL` to your production frontend URL
4. Use MongoDB Atlas for production database

```bash
npm start
```

### Frontend — Vercel / Netlify

1. Connect your GitHub repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-backend.railway.app/api`
   - `VITE_TELEGRAM_USERNAME=your_handle`

---

## 🔒 Security Features Implemented

### Authentication
- ✅ bcrypt password hashing (salt factor 12)
- ✅ JWT access tokens (15 min) + refresh tokens (7 days)
- ✅ Token rotation on every refresh
- ✅ All refresh tokens invalidated on password reset
- ✅ Email verification with 15-min expiry tokens
- ✅ Account lockout after 5 failed logins (30 min)
- ✅ Single-use password reset tokens

### API Security
- ✅ Helmet security headers
- ✅ CORS whitelist
- ✅ MongoDB sanitization (NoSQL injection prevention)
- ✅ Rate limiting on auth + API routes
- ✅ Input validation on all endpoints
- ✅ Generic error messages (no email enumeration)
- ✅ Secure HTTP-only cookies

### File Upload
- ✅ MIME type validation (jpg/png/webp only)
- ✅ File size limits (5MB products, 2MB avatars)
- ✅ Cloudinary secure storage
- ✅ Unique filenames

### Role-Based Access Control
- ✅ customer → shop only
- ✅ admin → products, orders, customers, settings
- ✅ superadmin → everything + admin management + security logs

### Monitoring
- ✅ Winston logging (error.log + combined.log)
- ✅ Security event logging (login, password, admin actions)
- ✅ Admin Security Logs page in dashboard

---

## 📱 Features Overview

### Customer Frontend
- Modern landing page with hero, featured products, categories
- Full shop with category filters, sort, pagination
- Product detail with image gallery, size/color selector
- Cart with quantity management
- Telegram order integration (pre-filled message)
- Light/Dark mode
- Mobile responsive

### Admin Panel
- Dashboard with charts (revenue, order status, categories)
- Product management (CRUD, multi-image upload)
- Order management with status updates
- Customer list
- Admin user management (super admin only)
- Security audit logs (super admin only)
- Profile settings + password change + avatar upload

---

## 🛒 Telegram Order Flow

1. Customer adds items to cart
2. Clicks "Order via Telegram"
3. Telegram opens with pre-filled message:
   ```
   Hello! I would like to order from HoodVault:

   • Urban Shadow Oversized Hoodie
     Size: L | Color: Midnight Black
     Qty: 2 × ETB 1,999 = ETB 3,998

   💰 Total: ETB 3,998

   Please provide delivery information.
   ```
4. Admin receives order in Telegram and creates order record manually
5. Admin updates order status from dashboard

---

## 🗄️ MongoDB Collections

| Collection    | Purpose                        |
|---------------|--------------------------------|
| users         | Customers + Admins             |
| hoodies       | Product catalog                |
| orders        | Order records                  |
| securitylogs  | Audit trail                    |

---

## 📧 Email Templates

- Account verification (15 min expiry)
- Password reset (15 min expiry, single use)
- Order confirmation (with itemized list)

---

## 🧰 Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS      |
| UI         | Radix UI, Framer Motion, Recharts             |
| State      | Zustand (cart), React Context (auth/theme)    |
| Backend    | Node.js, Express.js (ESM)                     |
| Database   | MongoDB + Mongoose                            |
| Auth       | JWT (access + refresh), bcryptjs              |
| Storage    | Cloudinary                                    |
| Email      | Nodemailer (SMTP)                             |
| Security   | Helmet, express-mongo-sanitize, rate-limit    |
| Logging    | Winston                                       |
