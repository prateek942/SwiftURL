# ⚡ SwiftURL — Premium Full-Stack URL Shortener

**SwiftURL** is a fast, responsive, and modern full-stack URL shortener application. It features a stunning glassmorphism Single Page Application (SPA) frontend and a secure Node.js, Express, PostgreSQL, and Drizzle ORM backend. 

Designed with modern web aesthetics, it includes a secure user authentication system, custom shortcodes, interactive link management, and full mobile responsiveness.

---

## ✨ Features

### 🎨 Frontend (Single Page Application)
- **Glassmorphism UI:** Vibrant, high-end dark theme with smooth gradient animated background orbs.
- **Custom Modals:** Fully styled animated dialogs replacing generic browser popups for confirmations.
- **Dynamic SPA Routing:** Fluid page switching without browser reloads.
- **Link Management:** Shorten long links, copy short URLs with a single click, open links in new tabs, and delete links instantly.
- **Mobile-Responsive:** Adaptive table layouts that transform into readable cards on smaller screens.
- **Interactive Toasts:** Real-time feedback alerts for copies, deletions, errors, and successful logins.

### ⚙️ Backend & Database
- **REST API:** Built with Node.js and Express.
- **Modern ORM:** High-performance database queries using Drizzle ORM.
- **Cloud Database:** Integrated with serverless PostgreSQL on Neon.
- **Secure Authentication:** JSON Web Tokens (JWT) for private endpoint protection and secure session management.
- **Input Validation:** Request body validation enforced with Zod schemas.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Vanilla JS, HTML5, CSS3 | Custom interactive logic & styling (no bulky frameworks) |
| **Backend** | Node.js + Express | RESTful API routing and middlewares |
| **Database** | PostgreSQL | Relational database hosted on Neon |
| **ORM** | Drizzle ORM | Type-safe queries, schema migration & push |
| **Auth** | JWT | Secure authorization header verification |
| **Validation** | Zod | Server-side request body parsing & schema safety |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd SwiftURL
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup your Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=your_jwt_secret_key
PORT=8000
```

### 4. Push database schemas to Neon
```bash
npm run db:push
```

### 5. Start the server
```bash
npm run dev
```
Open **http://localhost:8000** in your browser.

---

## 🔗 API Reference

### 🔐 Authentication Routes
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/user/signup` | Register a new user | Free |
| `POST` | `/user/login` | Log in and receive JWT token | Free |

### 🌐 URL Actions
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/shorten` | Shorten a URL (supports optional custom code) | JWT Required |
| `GET` | `/urls` | Get all URLs created by the user | JWT Required |
| `DELETE` | `/urls/:id` | Delete a specific shortened link | JWT Required |
| `GET` | `/:shortcode` | Redirect to target destination URL | Free |

---

## 🌐 Live Deployment Guide (Railway + Neon)

1. Create a serverless Postgres project on [Neon.tech](https://neon.tech) and copy the connection string.
2. Update your local `.env` and run `npm run db:push` to construct the tables.
3. Push your repository to GitHub.
4. Deploy on [Railway.app](https://railway.app):
   - Choose **Deploy from GitHub repo**.
   - Set the variables in the **Variables** settings tab:
     - `DATABASE_URL` = *(Your Neon Connection String)*
     - `JWT_SECRET` = *(Generate a secure random string)*
     - `PORT` = `8000` (Railway automatically binds this)
5. Under Railway service settings, click **Generate Domain** to get your public live URL (e.g. `https://swifturl.up.railway.app`).

