# CampusConnect — Complete Features & Capabilities Guide

> **CampusConnect: Placement Information System** is an end-to-end full-stack college placement portal built with Next.js 14 App Router, TypeScript, Prisma ORM, SQLite, Tailwind CSS, and Recharts.

---

## 👨‍🎓 1. Student Portal Features

### 🔐 Authentication & Session
- **Secure Registration:** Students sign up with Name, College Email, Password, University Roll Number, Department, Batch, CGPA, Phone, and Skills.
- **Unified Login with Role Switcher:** Fast-fill demo buttons for instantaneous demonstration.
- **Session Persistence:** HTTP-only 7-day signed JWT session cookies (`jose`).
- **Route Guard:** Middleware intercepts unauthenticated attempts to access `/student/*` and redirects to `/login`.

### 📊 Student Dashboard (`/student/dashboard`)
- **Key Metrics Overview:**
  - Total Submitted Applications
  - Shortlisted Applications
  - Upcoming Interview Calls
  - Confirmed Offers Extended
- **Profile Completion Progress Bar:** Tracks completeness with action reminders.
- **Upcoming Interview Calls:** Highlights interview date, time, mode (Online/Offline), round name, and direct meeting links.
- **Recent Applications Tracker:** Status badges showing live progress in campus drives.
- **Latest Placement Notices:** Broadcasted circulars from the placement cell.

### 👤 Profile & Placement Readiness Score (`/student/profile`)
- **Academic Record Management:** View and edit department, graduation batch, CGPA, WhatsApp contact number, and skills badges.
- **Verified Resume Management:**
  - Upload PDF/Word resume files (validated up to 5MB).
  - Download and inspect current resume file.
  - Delete resume file safely with confirmation.
- **INNOVATIVE: Placement Readiness Score (0 to 100):**
  - Evaluates student preparedness across 4 dimensions: Academics (25 pts), Verified Resume (25 pts), Technical Skills Breadth (25 pts), and Professional Bio (25 pts).
  - Displays classification tier: *Elite Ready*, *Placement Ready*, *Competitive Candidate*, or *Needs Action*.
  - Provides customized, actionable recommendations to reach 100%.

### 💼 Campus Drives & Job Discovery (`/student/jobs`)
- **Full Search Bar:** Instant reactive search by Job Title, Recruiter, Skill, or Location.
- **Multi-Criteria Filtering:**
  - Filter by Engineering Department (CSE, IT, DS, ECE, EE, ME).
  - Filter by Engagement Type (Full-Time vs Internship).
  - Filter by Minimum CGPA threshold (e.g. ≤ 6.5, ≤ 7.5, ≤ 8.0).
- **Flexible Sorting:** Sort by Newest First, Highest Package (CTC), or Deadline Approaching.
- **Tab Views:**
  - All Campus Drives
  - Eligible to Apply
  - Already Applied
  - Saved Bookmarks
- **INNOVATIVE: Smart Job Matching Algorithm:**
  - Calculates transparent compatibility % based on CGPA surplus, department match, and technical skill overlap.
  - Displays a compatibility pill on every job card (e.g. `92% Match`).
- **INNOVATIVE: Automatic Academic Eligibility Engine:**
  - Evaluates CGPA threshold, department permissions, and graduation batch on client and server.
  - Displays dynamic badges (`✓ Eligible to apply` or `✕ Not eligible: Required CGPA is 8.0, your CGPA is 6.9`).
  - Disables application buttons for ineligible students.
- **1-Click Application Submission:**
  - Opens modal with candidate credentials summary and optional cover note.
  - Physical database constraint prevents duplicate submissions.
- **Job Bookmarks:**
  - Save drives for later with 1 click.
  - Filter by bookmarked drives anytime.

### 📄 Deep-Link Job Details Page (`/student/jobs/[id]`)
- Comprehensive job descriptions, compensation breakdown, required skills, and deadline countdown.
- Full corporate recruiter profile, sector, and external careers portal link.
- **INNOVATIVE: Eligibility Transparency Checklist:**
  - Itemized 4-point pass/fail audit (CGPA, Department, Batch, Deadline) with clear explanations.
- Smart Job Match breakdown widget showing points earned per dimension.

### 📋 Applications Pipeline Tracker (`/student/applications`)
- 5-stage recruitment visual progression bar:
  `Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Interview Scheduled` ➔ `Selected / Rejected`
- **Application Withdrawal:**
  - Students can retract applications in `Applied` or `Under Review` status with 1 click.
  - Locked once shortlisted or selected to maintain institutional accreditation audit integrity.
- Attached interview rounds showing schedule, venue, and preparation notes.

### 🎤 Interview Calendar (`/student/interviews`)
- Upcoming interview rounds with date, time, mode (Online/Offline), meeting links, and coordinator notes.
- Completed/historical interview rounds log.

### 🔔 Real-Time Notification Center (`/student/notifications`)
- Header bell icon with dynamic unread count pill.
- In-app alerts generated upon:
  - Account registration
  - Application submission
  - Screening status update (Shortlisted, Selected)
  - Interview scheduling, rescheduling, or cancellation
- **Mark as Read** and **Mark All as Read** buttons.

---

## 🏛️ 2. Placement Administrator Portal Features

### 📈 Executive Analytics Dashboard (`/admin/dashboard`)
- **Key Performance Indicators (KPIs):**
  - Total Enrolled Students (30)
  - Total Corporate Recruiters (8)
  - Active Campus Drives (12)
  - Total Applications Submitted (40)
  - Confirmed Placed Candidates (11)
  - University Conversion Rate (36.7%)
- **Four Interactive Recharts Visualizations:**
  1. **Branch-wise Placement Statistics:** Grouped Bar Chart comparing total candidates vs placed candidates across CSE, IT, Data Sci, ECE, EE, and ME.
  2. **Application Status Flow:** Donut / Pie Chart showing recruitment pipeline conversion distribution.
  3. **Top Corporate Recruiters:** Horizontal Bar Chart ranking hiring partners by confirmed offers extended.
  4. **Monthly Recruitment Velocity:** Two-line Trend Chart tracking application volume and selections over time.
- **Live Application Activity Feed:** Most recent submissions with instant review links.

### 👥 Student Records & Dossier Management (`/admin/students`)
- **Directory Table:** Lists all registered students with roll numbers, departments, batches, CGPAs, and placement outcomes.
- **Search & Filters:** Search by name, roll number, email, or skills; filter by department; sort by CGPA ascending or descending.
- **Dossier Inspection Modal:** Inspect student's verified academic credentials, verified resume file download, and full application history.
- **Edit Student Details:** Administrators can correct or update student names, departments, CGPAs, batches, contact numbers, and skills.

### 🏢 Corporate Recruiter Management (`/admin/companies`)
- **Complete CRUD Operations:**
  - **Create:** Add visiting recruiter with Name, Industry, Location, Careers URL, Description, and Contact Email.
  - **Read:** Grid view displaying active drive counts and company cards.
  - **Update:** Edit existing recruiter information via modal dialog.
  - **Delete:** Remove recruiter with safety confirmation dialog.

### 💼 Campus Drives & Job Management (`/admin/jobs`)
- **Complete CRUD Operations:**
  - **Create:** Post new drive with company selector, title, package (CTC), minimum CGPA, eligible departments, graduation year, deadline date, and desired skills. Automatically broadcasts an announcement to eligible students.
  - **Read:** Table view showing criteria, salary, deadlines, and total applicant counts.
  - **Update:** Edit existing drive details via modal dialog.
  - **Toggle Active / Inactive:** Close or reopen campus drives with 1 click.
  - **Delete:** Remove opening with confirmation dialog.

### 📑 Applications Management Hub (`/admin/applications`)
- Filter applications by screening status (Applied, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected).
- Search candidates by name, roll number, company, or job title.
- **Instant Status Transition Dropdown:** Select new status; instantly updates database and dispatches real-time notification to the candidate.
- **Schedule Interview Round Button:** Directly opens interview scheduling modal for any shortlisted candidate.

### 📅 Interview Operations (`/admin/interviews`)
- View all scheduled technical, coding, and HR rounds.
- Search by candidate name, company, or round title.
- **Reschedule / Edit Interview:** Update round name, date/time, online/offline mode, meeting link, and candidate notes. Dispatches update alert to the student.
- **Cancel Interview:** Cancels round and notifies candidate.

### 📢 Announcements Broadcast (`/admin/announcements`)
- Publish campus-wide or branch-targeted notices.
- Set priority tiers: `HIGH` (Urgent), `MEDIUM`, or `LOW`.
- Edit existing notices via modal dialog.
- Delete notices with confirmation dialog.

### 📊 Accreditation & CSV Export Hub (`/admin/reports`)
Standardized RFC 4180 CSV export files compliant with NIRF, NAAC, and NBA accreditation reporting standards:
1. **Student Census & Academic Directory (CSV)**
2. **Recruitment & Selection Audit Log (CSV)**
3. **Campus Drives & Job Postings Catalog (CSV)**
4. **Placed Candidates Honor Roll (CSV)**
5. **Department-wise Placement Summary (CSV)**

---

## 🔒 3. Security & Engineering Standards

- **Password Encryption:** 10 rounds of bcrypt salting; plain-text passwords never stored.
- **Session Security:** `jose` signed HS256 JWT tokens transmitted over `httpOnly`, `sameSite: lax` cookies.
- **Server-Side Authorization:** Next.js Edge Middleware restricts route access. All API endpoints derive user identity from verified cookies, preventing ID spoofing.
- **File Upload Protection:** Strict MIME type verification (`application/pdf`, `.docx`), 5MB size limit, sanitized filenames, and path traversal prevention.
- **Unique Relational Integrity:** Enforces composite keys to guarantee zero duplicate submissions.
