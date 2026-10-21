# ProjectPulse Frontend

A modern, role-based web application for student project submissions, mentor reviews and administrative user management built with **Next.js 16 (App Router & Turbopack)**, **TypeScript 5**, **Tailwind CSS v4** and **Zod**.

---

## 🚀 Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **Universal Token Persistence:** JWT stored in both `localStorage` and `Cookies` for universal client & edge middleware compatibility.
- **Strict Role Redirection:**
  - `ADMIN` ➔ `/admin/dashboard`
  - `MENTOR` ➔ `/dashboard`
  - `STUDENT` ➔ `/submit`
- **Mentor Approval Flow Handling:** 
  - When mentors register via `/signup`, accounts are automatically placed in `PENDING` status.
  - If a pending mentor attempts to log in before administrator approval, the frontend catches the `403 Forbidden` response and displays an informative **Account Notice banner**.
  - Account suspension (`BLOCKED`) and deactivation (`isDeleted`) statuses are visually identified with helpful guidance.
- **Quick Demo Autofill:** One-click credential switcher on `/login` to instantly sign in as Admin, Mentor, or Student.

---

### 2. Administrator Command Center (`/admin/dashboard`)
- **Real-Time Platform Analytics:** Metric cards tracking **Total Registered Users**, **Pending Mentors Awaiting Approval**, **Active Mentors**, **Active Students** and **Suspended/Blocked Accounts**.
- **Action-Required Alert Banner:** Prominently alerts administrators when new teacher applications are awaiting review with a direct shortcut to the approval portal.
- **Recent Registrations Table:** Live view of the latest user signups with fast inline actions (View Profile, Quick Approve, Suspend/Block).

---

### 3. Teacher / Mentor Verification & Pending Page (`/admin/pending-teachers`)
- **Focused Review Pipeline:** Dedicated queue filtering mentors awaiting activation (`role=MENTOR` & `status=PENDING`).
- **One-Click Decisions:**
  - **Approve & Activate:** Sets status to `ACTIVE`, immediately enabling mentor login and submission grading access.
  - **Reject / Suspend:** Sets status to `BLOCKED`.
  - **Deactivate:** Soft-deletes user record.
- **Live Search & Dynamic Filtering:** Instant search by name or email with status toggles (`PENDING`, `ACTIVE`, `BLOCKED`, `ALL`).
- **Comprehensive Details Drawer:** Inspect teacher details, registration date and past submission reviews.

---

### 4. Complete User Management & CRUD Dashboard (`/admin/users`)
- **Full User Lifecycle Management:**
  - **Create User (`POST /api/v1/users`):** Modal to provision new accounts with custom names, emails, passwords, roles (`STUDENT`, `MENTOR`, `ADMIN`) and initial statuses.
  - **Edit User (`PATCH /api/v1/users/:id`):** Update user profile, authorization role, status, or reset credentials.
  - **Quick Status Toggle (`PATCH /api/v1/users/:id/status`):** Instant status changes between `ACTIVE`, `PENDING` and `BLOCKED`.
  - **Soft Delete (`DELETE /api/v1/users/:id`):** Safely deactivates accounts without database data loss. Protects primary Super Admin account (`superadmin@admin.com`) against accidental deletion.
  - **Account Restore (`PATCH /api/v1/users/:id/restore`):** Reactivate previously soft-deleted accounts.
  - **Detailed Profile Modal (`GET /api/v1/users/:id`):** Inspect full profile, timestamps and all student project submissions.
- **Search, Role Filtering & Soft-Deleted Toggle:** Search by name/email, filter by role/status and toggle "Include soft-deleted accounts" (`includeDeleted=true`).
- **Pagination:** Clean Next/Previous navigation with total user counters.

---

### 5. Mentor Review Dashboard (`/dashboard`)
- **Review Metrics:** Visual statistic cards (`StatCard`) tracking **Pending Reviews**, **Approved Projects** and **Rejected Projects**.
- **Data Table:** Interactive table showing student details, repository links, live preview buttons and review status.
- **Status Filter:** Instant filtering (`ALL`, `PENDING`, `APPROVED`, `REJECTED`).
- **Instant Actions:** Approve (Green) and Reject (Red) buttons with row-specific loading indicators and automatic data re-fetching.

---

### 6. Student Project Submission Portal (`/submit`)
- **Deliverables Submission:** Form to submit `projectName`, `repoUrl`, `liveLink` and `description`.
- **Strict Validation:** Ensures URLs conform to standard formats using `z.string().url()`.
- **Conflict Prevention:** Handles `409 Conflict` gracefully when a repository has already been submitted.
- **Rate Limit Resilience:** Displays notification on `429 Too Many Requests`.

---

### 7. Edge Route Protection Middleware (`src/middleware.ts`)
- **Universal Route Guards:** Blocks unauthenticated access to `/dashboard`, `/submit` and `/admin/:path*`.
- **Role-Based Isolation:**
  - Non-admins attempting to access `/admin/:path*` are redirected to their authorized dashboard.
  - Students attempting to open mentor pages are redirected to `/submit`.
  - Mentors attempting to open student submit forms are redirected to `/dashboard`.
- **Auth Bypassing:** Logged-in users navigating to `/login` or `/signup` are redirected to their portal.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 & Lucide React Icons
- **HTTP Client:** Axios (Configured instance with Bearer Token interceptor)
- **Validation:** Zod 4 & React Hook Form (`@hookform/resolvers`)
- **Notifications:** Sonner Toast
- **Auth Utilities:** `jwt-decode` & `js-cookie`

---

## 📁 Project Structure

```text
src/
 ├── app/
 │    ├── (admin)/
 │    │    ├── admin/
 │    │    │    ├── dashboard/page.tsx         # Admin Overview & Platform Analytics
 │    │    │    ├── pending-teachers/page.tsx  # Teacher Pending Approvals Page
 │    │    │    ├── users/page.tsx             # Complete User Management & CRUD Dashboard
 │    ├── (auth)/
 │    │    ├── login/page.tsx                  # Login with demo autofill & 403 status notices
 │    │    ├── signup/page.tsx                 # Signup with role selector & mentor approval info
 │    ├── (student)/
 │    │    ├── submit/page.tsx                 # Student Project Submission Portal
 │    ├── (mentor)/
 │    │    ├── dashboard/page.tsx              # Mentor Review Dashboard & Metrics
 │    ├── globals.css                          # Global styles & Tailwind CSS v4 theme
 │    ├── layout.tsx                           # Root layout with Sonner Toaster
 │    ├── page.tsx                             # Root redirect (➔ /login)
 ├── components/
 │    ├── admin/
 │    │    ├── StatusBadge.tsx                 # UserRoleBadge and UserStatusBadge
 │    │    ├── UserFormModal.tsx               # Modal for creating and updating user records
 │    │    ├── UserDetailsModal.tsx            # Modal inspecting user profile & submissions
 │    ├── shared/
 │    │    ├── Navbar.tsx                      # Dynamic Navbar supporting Student, Mentor and Admin
 │    │    ├── StatCard.tsx                    # Multi-variant Metric Card (pending, approved, rejected, purple, default)
 │    ├── ui/                                  # Reusable UI primitives (Button, Input, Card, Table, Skeleton, Badge, etc.)
 ├── lib/
 │    ├── axiosInstance.ts                     # Configured Axios with Bearer Token request interceptor
 │    ├── auth.ts                              # Token persistence, JWT decode, role & status helpers
 │    ├── utils.ts                             # Tailwind clsx/twMerge utility
 └── middleware.ts                             # Edge Route Protection & Strict RBAC Middleware
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18.18.0 or later)
- Running [ProjectPulse Backend](https://project-pulse-backend-rose.vercel.app/api/v1)

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://project-pulse-backend-rose.vercel.app/api/v1
```

### 3. Installation
```bash
npm install
```

### 4. Running the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🧪 Default Test Accounts

| Role | Email | Password | Landing Portal | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@admin.com` | `adminadmin` | `/admin/dashboard` | Full User CRUD, Approve/Reject Mentors, Soft-Delete & Restore |
| **Mentor (Active)** | `lead_mentor@example.com` | `password123` | `/dashboard` | Review student submissions, Approve/Reject projects |
| **Student** | `teststudent_auto@test.com` | `password123` | `/submit` | Submit project repositories and deployment URLs |

---

## 📜 License
This project is private and proprietary.