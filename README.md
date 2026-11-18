# CampusConnect — Placement Information System (PIS)

> **Connecting Students With Career Opportunities.**  
> An innovative, full-stack college examination capstone project engineered with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, SQLite, and Recharts.

---

## 🌟 Executive Overview

**CampusConnect** is a comprehensive, production-grade university placement management platform. It replaces outdated spreadsheets and manual screening with:

1. **Automated Academic Eligibility Engine:** Automatically validates candidate criteria (minimum CGPA threshold, eligible engineering branches, graduation batch) before allowing application submissions.
2. **Duplicate Prevention Guarantee:** Unique relational constraints prevent accidental duplicate submissions.
3. **Live Recruitment Pipeline:** Tracks student progression from *Applied* → *Under Review* → *Shortlisted* → *Interview Scheduled* → *Selected / Rejected*.
4. **Administrative Executive Console:** Interactive Recharts visual analytics (branch-wise placement rates, conversion funnels), recruiter directory management, candidate shortlisting, interview scheduling, and instant CSV audit exports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server & Client Components) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS with custom design tokens (Navy Sidebar, Brand Blue) |
| **Database & ORM** | SQLite with Prisma ORM 5 |
| **Analytics & Data Viz** | Recharts (Responsive Bar Charts, Donut Pie Charts) |
| **Security & Auth** | Hashed passwords (`bcryptjs`), JWT cookies (`jose`), role middleware |
| **Validation** | Zod schemas for forms and server actions |
| **UI Components & Icons**| Custom modern SaaS design system with `lucide-react` & `sonner` toasts |

---

## 🚀 Quick Start (Running Locally on macOS)

### 1. Prerequisites
Ensure **Node.js (v18 or higher)** and **npm** are installed:
```bash
node -v
npm -v
```

### 2. Install Dependencies
```bash
cd /Users/milanadak/Documents/Placement_Information_System
npm install
```

### 3. Initialize Database & Seed Demo Data
Synchronize the SQLite schema and populate realistic demo records (30 students across 6 departments, 8 companies, 12 jobs, 40 applications, interviews, and announcements):
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Evaluation Credentials

### Administrator Account
| Field | Value |
| :--- | :--- |
| **Email** | `admin@campusconnect.edu` |
| **Password** | `Admin@12345` |
| **Role** | Placement Administrator (Dr. Rajeshwar Rao, Head - T&P) |
| **Portal URL** | `/admin/dashboard` |

> *Tip: On the `/login` page, you can click the **"Demo Administrator"** fast-fill button to populate these credentials instantly.*

---

### Sample Student Accounts
All 30 demo students share the default password: **`Student@12345`**

| Student Name | Email | Department | CGPA | Key Status |
| :--- | :--- | :--- | :--- | :--- |
| **Aravind Sharma** | `aravind.sharma@campusconnect.edu` | Computer Science | 9.25 | Selected (Google, Microsoft) |
| **Priya Patel** | `priya.patel@campusconnect.edu` | Computer Science | 8.85 | Interview Scheduled (Google) |
| **Ananya Deshmukh** | `ananya.deshmukh@campusconnect.edu` | Information Technology | 8.60 | Interview Scheduled (Microsoft) |
| **Karan Johar** | `karan.johar@campusconnect.edu` | Data Science | 8.90 | Interview Scheduled (Google AI) |
| **Siddharth Rao** | `siddharth.rao@campusconnect.edu` | Electronics | 8.75 | Selected (Texas Instruments) |
| **Harish Pillai** | `harish.pillai@campusconnect.edu` | Electrical Engineering | 8.40 | Selected (L&T Technology) |
| **Rishabh Tripathi**| `rishabh.tripathi@campusconnect.edu` | Mechanical Engineering | 8.30 | Selected (L&T Robotics) |
| **Aditya Verma** | `aditya.verma@campusconnect.edu` | Computer Science | 6.85 | In Progress (Tests CGPA limits) |

> *Tip: On the `/login` page, you can click the **"Demo Student"** fast-fill button to log in as Aravind Sharma.*

---

## 🧪 Demonstration & Testing Walkthrough Guide

### Scenario 1: Automatic Eligibility Engine & Applying
1. Log in as **Aravind Sharma** (`aravind.sharma@campusconnect.edu` / `Student@12345`).
2. Navigate to **"Explore Jobs"** (`/student/jobs`).
3. Notice that jobs where his CGPA (9.25) and CSE branch match display:
   - Green badge: `✓ Eligible to apply`.
4. Jobs requiring other departments or where he already applied display:
   - `✓ Already Applied` with his current status (`Selected`).
5. Now, sign out and sign in as **Aditya Verma** (`aditya.verma@campusconnect.edu`, CGPA: 6.85).
6. Look at the Google SDE opening (Requires CGPA 8.0):
   - Notice the dynamic alert badge:
     `✕ Not eligible: Required CGPA is 8.0, your CGPA is 6.9.`
   - The "Apply" button is disabled.

### Scenario 2: Student Profile & Resume Upload
1. Log in as a student and click **"My Profile"** (`/student/profile`).
2. Update skills or contact phone number. Click **"Save Changes"**.
3. In the **"Verified Resume"** box, pick a PDF file and click **"Upload New Resume"**.
4. The file is validated (max 5MB, PDF/DOCX) and saved to `/uploads/resumes/` with the profile completion score increasing to 100%.

### Scenario 3: Placement Administrator Workflow
1. Log in as **Administrator** (`admin@campusconnect.edu` / `Admin@12345`).
2. **Dashboard (`/admin/dashboard`):**
   - Review executive KPIs (Total Students: 30, Companies: 8, Active Drives: 12, Total Applications: 40, Placement Rate).
   - Inspect the interactive Recharts graphs:
     - Branch-wise Placement Bar Chart
     - Application Funnel Pie Chart
3. **Student Records (`/admin/students`):**
   - Search by name or filter by department.
   - Click **"Review Dossier"** on any student to view their academic records, resume file link, and all application histories.
4. **Applications Management (`/admin/applications`):**
   - Filter by status (e.g. "Under Review" or "Shortlisted").
   - Change a student's status via the dropdown (e.g. from *Under Review* to *Shortlisted*).
   - Click **"Schedule Round"** to set up a technical interview with Date, Time, and Google Meet URL.
5. **Auditing & CSV Export (`/admin/reports`):**
   - Click **"Export Students Directory (CSV)"** to instantly download the complete student database.
   - Click **"Export Placements Audit Report (CSV)"** for NIRF/NAAC college accreditation filings.

---

## 📁 Project Architecture & Key Files

```
Placement_Information_System/
├── prisma/
│   ├── schema.prisma             # Relational SQLite database schema
│   ├── seed.js                   # Demo data generator (30 students, 8 companies, 12 jobs, 40 apps)
│   └── dev.db                    # SQLite database file
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx          # Landing page with stats, hero, and features
│   │   │   ├── about/            # Placement cell policies and guidelines
│   │   │   ├── companies/        # Corporate recruiters directory
│   │   │   ├── jobs/             # Public jobs explorer
│   │   │   ├── login/            # Unified authentication with role tabs & fast-fill
│   │   │   └── register/         # Student registration form
│   │   ├── student/
│   │   │   ├── layout.tsx        # Navy sidebar and navigation
│   │   │   ├── dashboard/        # Student metrics, interview calls & notices
│   │   │   ├── jobs/             # Jobs explorer with automatic eligibility engine
│   │   │   ├── applications/     # Visual application pipeline tracker
│   │   │   ├── interviews/       # Schedule of upcoming & completed interviews
│   │   │   ├── announcements/    # Department-targeted notices
│   │   │   └── profile/          # Profile management & resume upload
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Navy admin sidebar
│   │   │   ├── dashboard/        # KPIs & interactive Recharts visualizations
│   │   │   ├── students/         # Student dossiers & CGPA filters
│   │   │   ├── companies/        # Recruiter partner CRUD
│   │   │   ├── jobs/             # Campus drive creator & criteria settings
│   │   │   ├── applications/     # Candidate shortlisting & status manager
│   │   │   ├── interviews/       # Scheduled interview rounds
│   │   │   ├── announcements/    # Notice broadcast publisher
│   │   │   └── reports/          # Standardized CSV report downloads
│   │   └── api/                  # Secure REST API endpoints (Auth, Student, Admin, CSV)
│   ├── components/
│   │   ├── ui/                   # Reusable UI primitives (Button, Card, Badge, Input)
│   │   ├── admin/                # Recharts visualizations
│   │   ├── navbar.tsx            # Global public navigation
│   │   └── footer.tsx            # Institutional placement cell footer
│   ├── lib/
│   │   ├── auth.ts               # Password hashing (bcryptjs) & JWT session cookies (jose)
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── utils.ts              # Styling and formatting utilities
│   └── middleware.ts             # Role-based route protection (/student/* & /admin/*)
```

---

## 🔒 Security Best Practices Implemented

- Passwords are securely hashed with 10 salt rounds via `bcryptjs`.
- Session tokens are digitally signed with HS256 (`jose`) and transmitted via `httpOnly`, `sameSite: lax` cookies.
- Server-side route authorization in Next.js `middleware.ts` prevents students from accessing `/admin/*` and unauthenticated users from accessing private dashboards.
- Server-side eligibility checks enforce CGPA and branch restrictions before database insertion.
- Composite unique database index `@@unique([studentId, jobId])` physically prevents duplicate submissions.
- File uploads are validated for MIME type (`application/pdf`, `.docx`) and capped at 5 MB.
