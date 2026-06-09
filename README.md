# 🎓 GSS Gadau Online Examination System

A comprehensive, production-ready online examination platform for Government Secondary School Gadau, Bauchi State, Nigeria.

Built with **React + Vercel Serverless Functions + PostgreSQL (Neon)** — fully deployable on Vercel's free tier.

---

## ✨ Features

| Role | Capabilities |
|------|-------------|
| **Admin** | User management, subject CRUD, view all exams & results, announcements, system stats |
| **Teacher** | Create & publish exams, build question banks (MCQ/T-F/Short), view class results |
| **Student** | Take timed exams, auto-save answers, instant graded results, answer review, history |

**System Highlights**
- 🔒 JWT-based authentication with role guards
- ⏱️ Live countdown timer with auto-submit on timeout
- 📊 Auto-grading with grade calculation (A–F)
- 📱 Fully responsive — works on phones, tablets, laptops
- 🔔 In-app notifications (exam published, result submitted)
- 📈 Dashboard analytics with Recharts
- 🎨 World-class EduTech UI (deep indigo + amber theme)

---

## 🗂️ Project Structure

```
gss-exam-system/
├── api/                        ← Vercel Serverless Functions (Node.js)
│   ├── lib/
│   │   ├── db.js               ← PostgreSQL pool + schema bootstrap
│   │   └── helpers.js          ← CORS, JWT auth, response utils
│   ├── auth/[action].js        ← /api/auth/login|register|me
│   ├── admin/[resource].js     ← /api/admin/stats|users|subjects|results
│   ├── exams/index.js          ← /api/exams (full CRUD + questions)
│   ├── attempts/index.js       ← /api/attempts (start|answer|submit|result)
│   ├── misc/[resource].js      ← /api/misc/notifications|announcements|subjects
│   ├── init.js                 ← /api/init (one-time DB bootstrap)
│   ├── health.js               ← /api/health
│   └── package.json
├── client/                     ← React SPA
│   ├── public/index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/        ← World-class landing page
│   │   │   ├── auth/           ← Login + Register
│   │   │   ├── admin/          ← Admin dashboard suite
│   │   │   ├── teacher/        ← Teacher dashboard + exam builder
│   │   │   ├── student/        ← Student dashboard + exam taking
│   │   │   └── shared/         ← Layout, Notifications, ProtectedRoute
│   │   ├── context/AuthContext.jsx
│   │   ├── utils/api.js        ← Axios + all API helpers
│   │   └── styles/globals.css
│   └── package.json
├── vercel.json                 ← Vercel routing config
└── README.md
```

---

## 🚀 Deployment — Step by Step

### 1. Create a Neon Database (free)

1. Go to **https://neon.tech** → Sign up free
2. Create a new project → name it `gss-gadau`
3. Copy the **connection string** — looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Push code to GitHub

```bash
cd gss-exam-system
git init
git add .
git commit -m "Initial commit — GSS Gadau Exam System"
# Create a GitHub repo, then:
git remote add origin https://github.com/YOUR_USERNAME/gss-exam-system.git
git push -u origin main
```

### 3. Deploy to Vercel (free)

1. Go to **https://vercel.com** → Sign up / Log in with GitHub
2. Click **"Add New Project"** → Import your GitHub repo
3. Vercel auto-detects the config from `vercel.json`
4. **Add Environment Variables** (Settings → Environment Variables):

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
   | `JWT_SECRET` | Any long random string, e.g. `gss_gadau_jwt_2024_xK9mP3qR7vN2wL5` |

5. Click **Deploy** 🚀

### 4. Bootstrap the database (one-time)

After deploy, visit:
```
https://your-app.vercel.app/api/init
```

You'll see:
```json
{
  "ok": true,
  "message": "Database initialised & admin seeded",
  "admin": {
    "email": "admin@gssgadau.edu.ng",
    "password": "Admin@2024"
  }
}
```

### 5. Done! 🎉

Visit your app at `https://your-app.vercel.app`

**Default login:**
- Email: `admin@gssgadau.edu.ng`
- Password: `Admin@2024`

> ⚠️ **Change the admin password immediately** after first login!

---

## 💻 Local Development

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/gss-exam-system.git
cd gss-exam-system

# Install all dependencies
cd api && npm install && cd ..
cd client && npm install && cd ..

# Set up API environment
cp api/.env.example api/.env
# Edit api/.env — add your DATABASE_URL and JWT_SECRET

# Terminal 1 — API (uses vercel dev for serverless functions)
npm install -g vercel
vercel dev

# Terminal 2 — React client
cd client && npm start
```

The React app proxies `/api/*` requests to the Vercel dev server automatically.

---

## 🗄️ Database Schema

```
users           — all roles (admin, teacher, student)
subjects        — school subjects with teacher assignment
exams           — exam definitions with timing & settings
questions       — MCQ / True-False / Short Answer questions
exam_attempts   — student attempts with auto-graded answers (JSONB)
notifications   — per-user notification feed
announcements   — school-wide announcements
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Recharts |
| Styling | Pure CSS (custom design system, no Tailwind) |
| API | Vercel Serverless Functions (Node.js 18) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Database | PostgreSQL on Neon (free serverless tier) |
| Deployment | Vercel (free hobby tier) |
| Hosting cost | **$0/month** |

---

## 📋 Default Classes

JSS 1 · JSS 2 · JSS 3 · SS 1 · SS 2 · SS 3

---

## 🔐 Security Notes

- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire in 7 days
- Role-based access control on every API route
- CORS configured for same-origin (Vercel handles this)
- Student answers auto-saved every interaction
- Exam timer enforced server-side on submission

---

## 📞 Support

Built for GSS Gadau, Bauchi State, Nigeria.
For technical issues, check the Vercel function logs in your dashboard.
