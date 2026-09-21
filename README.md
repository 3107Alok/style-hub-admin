# StyleHub - Admin Web Portal

A standalone, ultra-modern Single Page Application (SPA) for managing StyleHub E-Commerce Store. Built with vanilla HTML5, CSS3 Glassmorphism, JavaScript (ES6+), and Chart.js.

---

## 🌟 Key Features

1. **🔐 Secure Admin Authentication:**
   - Preconfigured credentials:
     - **Email:** `admin@stylehub.com`
     - **Password:** `admin`
   - Role-based authorization (`ROLE_ADMIN` check).
2. **📊 Real-Time Analytics:**
   - Live Revenue, Total Orders, Active Products, and Registered Users counters.
   - Interactive revenue trend and order status distribution charts via **Chart.js**.
3. **🛍️ Product Management:**
   - Search & Filter by product name, brand, or category.
   - **Add Product:** Form with category selection, price, discount, stock, and descriptions.
   - **Edit Product:** Update title, description, pricing, or stock with live backend sync.
   - **Delete Product:** Instant deletion with confirmation.
4. **📦 Order Management:**
   - Complete customer order details, timestamps, items, and payments.
   - Dropdown status updater (`PLACED` ➡️ `PROCESSING` ➡️ `SHIPPED` ➡️ `DELIVERED` ➡️ `CANCELLED`).
5. **🏷️ Categories & 🎟️ Coupons:**
   - Add store categories.
   - Create promotional discount promo codes.

---

## 🚀 How to Run Locally

Simply double-click `index.html` or open it in any modern web browser:
```bash
# Optional: Run with any local server
npx serve .
# Or Python
python -m http.server 3000
```

---

## 🌐 How to Push to a New GitHub Repository

Since this folder is completely decoupled from the mobile app, you can publish it as its own repository:

```bash
cd admin-portal
git init
git add .
git commit -m "Initial commit: StyleHub Admin Web Dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/stylehub-admin-portal.git
git push -u origin main
```

---

## ☁️ Deployment

Deploy for free on **Vercel**, **Netlify**, or **GitHub Pages**:
- **Vercel:** Drag and drop this folder on [vercel.com](https://vercel.com)
- **Netlify:** Drag and drop on [netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Pages:** Go to Repo Settings -> Pages -> Deploy from `/root`
