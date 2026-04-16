# 🚀 SK Trading Company Management System

A premium, full-stack management solution tailored for SK Trading. This system streamlines order entry, tracks real-time production progress, and manages complex payment schedules with a modern, glassmorphism-inspired interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Vercel](https://img.shields.io/badge/deploy-Vercel-black.svg)

---

## ✨ Key Features

- **🛒 Smart Order Management**: Step-based wizard for creating complex orders with customer details and product specifications.
- **🏗️ Production Tracking**: Log daily production metrics and monitor order status from "Pending" to "Completed".
- **💰 Payment Management**: Comprehensive dashboard to track received payments, balance dues, and payment histories.
- **📊 Real-time Dashboard**: Quick overview of business health, pending tasks, and production logs.
- **🎨 Premium UI/UX**: Clean, minimal design using Tailwind CSS with glassmorphism effects and responsive layouts.
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile views.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Navigation**: [React Router 7](https://reactrouter.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **ODM**: [Mongoose](https://mongoosejs.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd sk-trading
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sk_trading
PORT=5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Locally
You can use the root scripts:
```bash
npm run start:backend  # Starts backend on port 5000
npm run start:frontend # Starts frontend on port 5173
```
*Alternatively, use the provided `.bat` files on Windows.*

---

## 📂 Project Structure

```text
├── frontend/             # Vite + React Application
│   ├── src/
│   │   ├── api/         # Axios configuration
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Core business modules
│   │   └── App.jsx      # Root routing
├── backend/              # Node.js + Express API
│   ├── models/           # Mongoose schemas (Order, Payment, ProductionLog)
│   ├── routes/           # API endpoints
│   └── server.js         # Entry point
├── package.json          # Root build scripts
└── vercel.json           # Vercel deployment configuration
```

---

## ☁️ Deployment

### Vercel Deployment
This project is pre-configured for Vercel. 
1. Push your code to GitHub.
2. Connect your repo to Vercel.
3. Add Environment Variables: `MONGODB_URI`, `VITE_API_URL` (set to `/api`), and `FRONTEND_URL`.
4. Deploy!

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Developed for SK Trading Company.*
