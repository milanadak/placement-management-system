# CampusConnect — Placement Information System (PIS)

> **Connecting Students With Career Opportunities.**  
> An innovative, full-stack college examination capstone project engineered with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, SQLite, and Recharts.

---

## 🌟 Executive Overview

**CampusConnect** is a comprehensive, production-grade university placement management platform designed for college placement cells, training and placement officers (TPOs), and graduating students. It replaces fragmented spreadsheets and manual screening with:

1. **Student Profile & Academic Dossier (5 Tabs):** `Overview | Academics | Skills & Projects | Resume | Applications` featuring semester SGPA history, 10th/12th percentages, active backlogs, projects, internships, soft skills, certifications, and embedded in-browser PDF resume previewer.
2. **Placement Eligibility Checker (`/admin/eligibility`):** Configurable criteria by admin (CGPA, backlogs, 10th %, 12th %, branch, batch, skills), real-time student eligibility calculation, single-student simulator with pass/fail reasons (✓/✕), entire batch eligibility metrics, preset drive selector, and downloadable eligible student lists in CSV.
3. **Admin Executive Analytics Dashboard (`/admin/dashboard`):** 8 clickable KPI cards, 3 institutional CTC metrics (Highest, Average, Median CTC), branch/year filters, 6 interactive Recharts visualizations (Branch-wise, Pipeline Funnel, CGPA Histogram, Top Recruiters, Monthly Velocity, Year-wise Placement Comparison).
4. **Resume Upload & Management System:** PDF/DOC/DOCX multi-format validation, 5MB size limit, embedded PDF preview, replace, download, delete, and **authorized placement administrator upload on behalf of student** directly in `/admin/students`.
5. **Company & Campus Drive Management Hub:** Recruiter profiles with HR contact person, phone, and address; placement drive creation with vacancies, driveDate, and maxBacklogs; **"View Eligible Candidates" modal for any campus drive** with direct CSV export; and extended recruitment pipeline (`Applied → Shortlisted → Aptitude → Technical Interview → HR Interview → Selected → Rejected`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server & Client Components) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS with custom institutional design tokens |
| **Database & ORM** | SQLite with Prisma ORM 5 |
| **Analytics & Data Viz** | Recharts (Responsive Bar Charts, Donut Pie Charts, Velocity Line Charts) |
| **Security & Auth** | Hashed passwords (`bcryptjs`), JWT cookies (`jose`), Next.js Edge middleware |
| **Validation** | Zod schemas for forms, server actions, and API endpoints |
| **UI Components & Icons**| Modern SaaS design system with `lucide-react` & `sonner` notifications |
| **Automated Testing** | Zero-dependency standalone test runner (`scripts/test-runner.js`) |

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

### 5. Run Automated Test Suite
To execute the automated unit, security, eligibility, and integration test suite:
```bash
npm test
```
*Executes 36 tests verifying authentication, matching formulas, CGPA boundaries, file upload security, full placement eligibility gates, batch metrics, extended pipeline stages, and RFC 4180 CSV escaping with 100% pass rate.*

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

## 💡 Innovative Features Engineered for Capstone Examination

### 1. Smart Job Matching Algorithm (0–100%)
- **Objective Mathematical Engine:** Located in `src/lib/matching.ts`.
- **Weighted Multi-Factor Formula:**
  - **Academic Standing (35%):** Proportional score comparing student CGPA against job minimum threshold.
  - **Department Alignment (30%):** Matches student engineering branch against required disciplines.
  - **Technical Skills Overlap (25%):** Jaccard-style token overlap between student competencies and job requirements.
  - **Graduation Batch (10%):** Alignment with graduation batch year.
- Renders a color-coded match badge on job cards and an itemized score breakdown on the job details view (`/student/jobs/[id]`).

### 2. Placement Readiness Score (0–100)
- Located on `/student/profile`.
- Analyzes candidate profile completeness across 4 pillars:
  - **Academic Standing (30 pts):** Based on cumulative CGPA.
  - **Verified Resume (25 pts):** Uploaded PDF/DOCX file.
  - **Technical Competencies (25 pts):** Breadth and density of registered skills.
  - **Professional Summary (20 pts):** Career bio and contact completeness.
- Assigns readiness tiers (*Elite Ready*, *Job Ready*, *Developing Profile*) and provides concrete recommendations for improvement.

### 3. Eligibility Transparency Checklist
- Interactive 4-point pass/fail modal on `/student/jobs/[id]`:
  1. Minimum CGPA criterion with exact requirement vs current GPA.
  2. Eligible departments list.
  3. Eligible graduation year.
  4. Application deadline verification.
- Eliminates student confusion by clearly displaying why an application is unlocked or disabled.

### 4. Job Bookmarking & Application Retraction
- Students can click the bookmark icon on any drive to save it for later review under the **"Saved Bookmarks"** tab.
- Students can safely withdraw pending applications on `/student/applications` if applied in error (restricted to "Applied" and "Under Review" stages to preserve audit integrity).

### 5. Centralized Notification Center
- Dedicated `/student/notifications` portal with live unread badge counter in top navigation.
- Dispatches automated system alerts on application submission, status progression, interview scheduling, and announcements.
- Supports marking individual items or "Mark All as Read".

### 6. 5 Accreditation-Grade CSV Audit Reports
- Generated via `/admin/reports` following standard RFC 4180 format (with field quoting and quote escaping):
  1. **Complete Student Master Directory CSV** (Roll number, Department, CGPA, Skills, Contact).
  2. **Comprehensive Applications Log CSV** (Candidate, Company, Role, Package, Status, Application Date).
  3. **Campus Drives Catalog CSV** (Active/Inactive drives, Criteria, Package, Deadlines).
  4. **Placed Candidates Honor Roll CSV** (Selected students, Company, Final CTC).
  5. **Department Placement Summary CSV** (Branch-wise total students, placed count, placement rate %).

---

## 🧪 Demonstration & Testing Walkthrough Guide

### Scenario 1: Automatic Eligibility Engine & Smart Match
1. Log in as **Aravind Sharma** (`aravind.sharma@campusconnect.edu` / `Student@12345`).
2. Navigate to **"Explore Jobs"** (`/student/jobs`).
3. Notice that jobs where his CGPA (9.25) and CSE branch match display:
   - Green badge: `✓ Eligible to apply` with high Smart Match % (e.g. `92% Match`).
4. Click on any job card to view the dedicated `/student/jobs/[id]` details page with the full 4-point eligibility checklist.
5. Sign out and log in as **Aditya Verma** (`aditya.verma@campusconnect.edu`, CGPA: 6.85).
6. Look at the Google SDE opening (Requires CGPA 8.0):
   - Notice the dynamic alert badge: `✕ Not eligible: Required CGPA is 8.0, your CGPA is 6.9.`
   - The "Apply" button is disabled.

### Scenario 2: Student Profile & Readiness Score
1. Log in as a student and click **"My Profile"** (`/student/profile`).
2. Inspect the **Placement Readiness Score** card displaying score breakdown and improvement tips.
3. Update skills or contact phone number and click **"Save Changes"**.
4. Test resume upload and resume deletion with instant status updates.

### Scenario 3: Placement Administrator Workflow
1. Log in as **Administrator** (`admin@campusconnect.edu` / `Admin@12345`).
2. **Dashboard (`/admin/dashboard`):**
   - Review executive KPIs (Total Students: 30, Companies: 8, Active Drives: 12, Total Applications: 40, Placement Rate).
   - Inspect the 4 interactive Recharts graphs (Branch Placement Bar Chart, Application Status Donut, Top Recruiters Bar Chart, Monthly Placement Velocity Line Chart).
3. **Student Records (`/admin/students`):**
   - Search by name or filter by department.
   - Click **"Review Dossier"** on any student to view their academic records, resume file link, application history, or edit their academic details.
4. **Campus Drives (`/admin/jobs`):**
   - Click **"Edit Drive"** to update criteria or click the status toggle button to toggle active/inactive status.
5. **Applications Management (`/admin/applications`):**
   - Filter by status, change a student's status via the dropdown, or schedule an interview round.
6. **Interviews Hub (`/admin/interviews`):**
   - View scheduled rounds, click **"Reschedule"** to edit time/meeting link, or click **"Cancel"** to cancel a round with automatic student notification.
7. **Auditing & CSV Export (`/admin/reports`):**
   - Download any of the 5 standardized CSV audit reports for college accreditation records.

---

## 📁 Project Architecture & Key Files

```
Placement_Information_System/
├── prisma/
│   ├── schema.prisma             # Relational SQLite database schema (Users, Profiles, Jobs, Bookmarks, etc.)
│   ├── seed.js                   # Demo data generator (30 students, 8 companies, 12 jobs, 40 apps)
│   └── dev.db                    # SQLite database file
├── scripts/
│   └── test-runner.js            # Automated 23-test unit, security, and integration test suite
├── src/
│   ├── app/
│   │   ├── (public)/             # Landing page, About, Companies, Public Jobs, Login, Register
│   │   ├── student/
│   │   │   ├── layout.tsx        # Navy sidebar with live notification badge
│   │   │   ├── dashboard/        # Student metrics, interview calls & notices
│   │   │   ├── jobs/             # Jobs explorer with filters, sorting & bookmarks
│   │   │   │   └── [id]/         # Dedicated job detail page with Smart Match & Eligibility checklist
│   │   │   ├── applications/     # Application pipeline tracker with safe withdrawal
│   │   │   ├── notifications/    # Dedicated Notification Center with mark-as-read
│   │   │   ├── interviews/       # Schedule of upcoming & completed interviews
│   │   │   ├── announcements/    # Department-targeted notices
│   │   │   └── profile/          # Profile management, readiness score & resume upload/delete
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Navy admin sidebar
│   │   │   ├── dashboard/        # KPIs & 4 interactive Recharts visualizations
│   │   │   ├── students/         # Student dossiers, CGPA filters & academic record editing
│   │   │   ├── companies/        # Recruiter partner CRUD (Add, Edit, Delete)
│   │   │   ├── jobs/             # Campus drive CRUD (Add, Edit, Toggle Active, Delete)
│   │   │   ├── applications/     # Candidate shortlisting, status manager & interview scheduler
│   │   │   ├── interviews/       # Interview rounds management (Reschedule, Cancel)
│   │   │   ├── announcements/    # Notice broadcast publisher (Create, Edit, Delete)
│   │   │   └── reports/          # 5 Standardized CSV report downloads
│   │   └── api/                  # Secure REST API endpoints (Auth, Student, Admin, CSV)
│   ├── components/
│   │   ├── ui/                   # Reusable UI primitives (Button, Card, Badge, Input, Modal)
│   │   └── admin/                # Recharts visualizations (Bar charts, Donut charts, Line charts)
│   ├── lib/
│   │   ├── auth.ts               # Password hashing (bcryptjs) & JWT session cookies (jose)
│   │   ├── matching.ts           # Smart matching algorithm, readiness score & eligibility engine
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── utils.ts              # Styling and formatting utilities
│   └── middleware.ts             # Role-based route protection (/student/* & /admin/*)
```

---

## 🔒 Security Best Practices Implemented

- **Password Hashing:** Passwords hashed with 10 salt rounds via `bcryptjs`.
- **JWT Cryptographic Signatures:** Signed with HS256 (`jose`) and transmitted via `httpOnly`, `sameSite: lax` cookies.
- **Role Segregation:** Server-side route authorization in Next.js `middleware.ts` prevents students from accessing `/admin/*` and unauthenticated users from accessing private routes.
- **Server-Side Authorization & Anti-Tampering:** Student actions (apply, bookmark, withdraw, resume delete) extract `studentId` exclusively from the verified session JWT (`sessionUser.id`), preventing client-side user ID manipulation.
- **Database Unique Constraints:** Composite unique index `@@unique([studentId, jobId])` physically prevents duplicate submissions.
- **File Upload Security:** Validates MIME type (`application/pdf`, `.docx`), enforces a 5 MB maximum size limit, and sanitizes filenames using `path.basename` to prevent path traversal attacks.
- **Accreditation CSV Escaping:** Strict RFC 4180 compliance with double-quoting and quote escaping (`""`) preventing formula injection or corrupted spreadsheets.
