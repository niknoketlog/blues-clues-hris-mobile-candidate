# Blues Clues HRIS — Auth System Handoff Document

**Date:** 2026-03-12
**Scope:** System Admin User Creation · Applicant Sign Up · Employee Login

---

## Table of Contents

1. [Big Picture Overview](#1-big-picture-overview)
2. [System Admin User Creation](#2-system-admin-user-creation)
3. [Applicant Registration & Email Verification](#3-applicant-registration--email-verification)
4. [Employee Login](#4-employee-login)
5. [Applicant Login](#5-applicant-login)
6. [JWT Tokens & Session Management](#6-jwt-tokens--session-management)
7. [Auth Guard & Route Protection](#7-auth-guard--route-protection)
8. [Roles & Permissions (RBAC)](#8-roles--permissions-rbac)
9. [Email Delivery](#9-email-delivery)
10. [Database Schema — Key Tables](#10-database-schema--key-tables)
11. [Key File Locations](#11-key-file-locations)
12. [Environment Variables](#12-environment-variables)
13. [End-to-End Request Examples](#13-end-to-end-request-examples)

---

## 1. Big Picture Overview

The system has **two completely separate user populations**:

| Population                      | Portal             | Login Route              | Token Lifetime | Refresh Token?     |
| ------------------------------- | ------------------ | ------------------------ | -------------- | ------------------ |
| **Employees** (all staff roles) | `/login`           | `POST /login`            | 15 min access  | Yes — 7 or 30 days |
| **Applicants** (job candidates) | `/applicant/login` | `POST /applicants/login` | 8 hours access | No                 |

Employees are **created by admins** and onboarded via an invite email. Applicants **self-register** and go through email verification before they can log in.

The backend is a **NestJS** app at `tribeX-hris-auth-api/`. The frontend is a **Next.js** app at `frontend/blues-clues-hris-frontend-web/`. They communicate over REST. The database is **Supabase (PostgreSQL)**.

All API routes are prefixed: `/api/tribeX/auth/v1/`

---

## 2. System Admin User Creation

### Who can do this?

Only users with roles `Admin` or `System Admin` can create new users. The route is protected by `JwtAuthGuard` + `RolesGuard`.

### Frontend

- **Page:** `/(dashboard)/system-admin/users/page.tsx`
- An "Add User" button opens a slide-over panel (`AddUserPanel` component)
- **Fields:** First Name, Last Name, Username (globally unique), Email, Role (dropdown from `GET /users/roles`), Department (optional), Start Date (optional)
- On submit → calls `POST /users` with Bearer token in the Authorization header

### Backend Flow (`UsersService.create`)

**Route:** `POST /api/tribeX/auth/v1/users`

Step-by-step:

1. **Generate IDs**
   - `user_id` → UUID (random)
   - `employee_id` → calls Postgres RPC `get_next_employee_number(company_id)` → returns something like `empno-00001`

2. **Check username uniqueness** globally across the `user_profile` table

3. **Insert to `user_profile`** with:
   - `account_status = 'Pending'` (can't log in yet)
   - `password_hash = NULL` (no password yet)

4. **Generate invite token**
   - Raw token: 32 random bytes as hex string
   - Hashed token: `SHA256(raw_token)` — only the hash is stored in DB
   - Expiry: **48 hours**

5. **Insert to `user_invites`** table: `{ user_id, token_hash, expires_at }`

6. **Send invite email** via Gmail SMTP
   - Link in email: `/set-password?token={rawToken}`
   - Dev fallback: if email fails, the link is `console.log`'d

7. **Return** `{ user_id, employee_id, email, username }` to frontend
   - Frontend shows a toast and updates the users list (status shows as "Pending")

### Invite Redemption (`/set-password`)

- **Page:** `/app/set-password/page.tsx`
- Employee clicks the invite link, lands on "Set Your Password" page
- Enters new password + confirm (minimum 8 characters)
- Calls `POST /set-password` with `{ token, password }`

**Backend validates:**

- SHA256(token) exists in `user_invites`
- `used_at` is NULL (not already used)
- `expires_at` has not passed

**On success:**

- `bcrypt.hash(password, 12)` → stored as `password_hash`
- `account_status` updated to `'Active'`
- `user_invites.used_at` = now (one-time use)
- Frontend redirects to `/login` after 3 seconds

**Account status lifecycle:**

```
[Admin creates user] → Pending
[Employee clicks invite & sets password] → Active
[Admin deactivates] → Inactive
[Admin reactivates] → Active
```

---

## 3. Applicant Registration & Email Verification

Applicants self-register through the career portal. This is a two-step process: register, then verify email.

### Step 1: Registration

**Frontend:** `/app/(portal)/applicant/login/page.tsx` (Sign Up tab)
**Backend Route:** `POST /api/tribeX/auth/v1/applicants/register` (public, rate-limited)

**Form fields:** First Name, Last Name, Email, Password (min 8 chars), Phone Number (optional)

**Backend flow (`ApplicantsService.register`):**

1. **Duplicate check** — query `applicant_profile` by email; reject if already exists

2. **Hash password** — `bcrypt.hash(password, 12)`

3. **Generate IDs**
   - `applicant_id` → UUID
   - `applicant_code` → `APP-{random 7-digit number}` e.g. `APP-7654321`

4. **Insert to `applicant_profile`** with:
   - `status = 'unverified'`
   - `role = 'Applicant'`

5. **Generate verification token**
   - Raw token: 32 random bytes as hex
   - Hashed: `SHA256(raw_token)`
   - Expiry: **24 hours**

6. **Insert to `email_verifications`** table: `{ applicant_id, token_hash, expires_at }`

7. **Send verification email**
   - Link: `/applicant/verify-email?token={rawToken}`
   - Dev fallback: `console.log` the link

8. **Return** `{ applicant_id, applicant_code, email, first_name, last_name, message }`
   - Message: "Account created. Please check your email to verify your address."

**Key point:** The applicant **cannot log in** until their email is verified. Attempting login with `status = 'unverified'` will be rejected.

### Step 2: Email Verification

**Frontend:** `/app/(portal)/applicant/verify-email/page.tsx`
**Backend Route:** `GET /api/tribeX/auth/v1/applicants/verify-email?token={rawToken}` (public)

The page automatically fires the GET request on load (no button needed). It shows a spinner, then either a success or error message.

**Backend flow (`ApplicantsService.verifyEmail`):**

1. `SHA256(incoming_token)` → look up in `email_verifications`
2. Validate: exists, `used_at` is NULL, `expires_at` not passed
3. Mark used: `email_verifications.used_at = now`
4. Activate: `applicant_profile.status = 'active'`
5. Return: `{ message: "Email verified successfully. You can now sign in." }`

**Frontend on success:** Shows success message + button to go to `/applicant/login`
**Frontend on error:** Shows the specific reason (invalid token, already used, expired)

---

## 4. Employee Login

**Frontend:** `/app/(auth)/login/page.tsx`
**Backend Route:** `POST /api/tribeX/auth/v1/login` (public, rate-limited to 5 req/min)

### Frontend Form

- Email or Username (the `identifier` field)
- Password
- Remember Me checkbox
- Forgot Password link
- Link to the Applicant Portal

### Auto-Redirect on Page Load

Before showing the form, the login page checks: does the user already have a valid refresh token (HttpOnly cookie) + a `rememberMe` flag in storage? If yes, it silently calls `POST /refresh` and redirects to the dashboard — the user never sees the login form.

### Frontend Login Flow (after form submit)

1. POST `/login` with `{ identifier, password, rememberMe }`
2. Response: `{ access_token: "eyJ..." }`
3. Decode the JWT locally using `parseJwt()` (no library needed — just base64 decode)
4. Extract `role_name` from JWT payload
5. **Reject if role_name is "Applicant"** — applicants must use `/applicant/login`
6. Call `GET /me` to fetch additional user details (email, username)
7. Save to storage:
   - If `rememberMe = true` → `localStorage`
   - If `rememberMe = false` → `sessionStorage`
8. Navigate to role-based dashboard route:
   - System Admin → `/system-admin`
   - Admin → `/admin`
   - HR roles → `/hr`
   - Manager → `/manager`
   - Employee → `/employee`

### Backend Flow (`AuthService.login`)

1. **Validate identifier format** using regex `/^[a-zA-Z0-9._@\-]+$/`

2. **Find user** in `user_profile` by email OR username (`.or()` clause)

3. **Validations (in order):**
   - User must exist
   - `account_status !== 'Inactive'`
   - `password_hash` must not be NULL (invite not yet claimed)
   - `start_date <= today` (can't log in before employment start date)

4. **Verify password** — `bcrypt.compare(password, password_hash)`

5. **Log the attempt** — insert to `login_history` with `status = 'FAILED'` if password wrong, `'SUCCESS'` if correct

6. **Fetch role and company** from their respective tables

7. **Generate Access Token (15 min expiry)**

   ```json
   {
     "type": "access",
     "sub_userid": "uuid",
     "company_id": "string",
     "role_id": 1,
     "role_name": "Admin",
     "company_name": "Blue's Clues Inc.",
     "first_name": "John",
     "last_name": "Doe"
   }
   ```

8. **Generate Refresh Token**
   - Expiry: **7 days** normally, **30 days** if `rememberMe = true`
   - Payload: `{ type: "refresh", sub_userid, role_id, login_id, session_id }`
   - SHA256 hash stored in `refresh_session` table

9. **Set HttpOnly cookie** (refresh token)
   - `httpOnly: true` — JavaScript cannot read this
   - `secure: true` — HTTPS only in production
   - `sameSite: "none"` in production, `"lax"` in dev
   - `path: "/api/tribeX/auth"` — only sent to auth API routes
   - `maxAge`: 7 or 30 days depending on rememberMe

10. **Return** `{ access_token: "eyJ..." }` — refresh token is NEVER in the response body

---

## 5. Applicant Login

**Frontend:** `/app/(portal)/applicant/login/page.tsx` (Sign In tab)
**Backend Route:** `POST /api/tribeX/auth/v1/applicants/login` (public, rate-limited)

### Differences from Employee Login

- Input is **email only** (no username option)
- Access token expires in **8 hours** (not 15 min)
- **No refresh token** — when the 8-hour token expires, they must log in again
- **No Remember Me** feature
- Success redirects to `/applicant/dashboard`

### Backend Validations

1. Find applicant by email in `applicant_profile`
2. `status === 'active'` — unverified applicants are rejected
3. `password_hash` must exist
4. `bcrypt.compare(password, password_hash)`

### Access Token Payload

```json
{
  "type": "access",
  "sub_userid": "applicant_uuid",
  "role_name": "Applicant",
  "first_name": "Juan",
  "last_name": "Dela Cruz"
}
```

Note: No `company_id` or `role_id` for applicants.

---

## 6. JWT Tokens & Session Management

### Token Storage Strategy

- **Access Token** → stored in JavaScript memory (a module-level variable in `authStorage.ts`)
  - Never in localStorage directly (reduces XSS risk)
  - Copied to localStorage/sessionStorage only as a backup for page refreshes
- **Refresh Token** → stored in an HttpOnly cookie
  - JavaScript cannot access this at all
  - Browser automatically attaches it to matching requests

### Silent Token Refresh

Every protected API call goes through `authFetch()` in `lib/authApi.ts`:

```
authFetch(url, options)
  → attach Authorization: Bearer {access_token}
  → if response is 401:
      → POST /refresh  (browser sends HttpOnly cookie automatically)
      → store new access_token
      → retry original request with new token
      → if refresh also fails: clear storage + redirect to /login
```

This means the user is never interrupted by token expiry during normal use.

### Logout

**Route:** `POST /api/tribeX/auth/v1/logout`

1. Extract refresh token from HttpOnly cookie
2. Verify the JWT
3. Mark `refresh_session.revoked_at = now` (invalidates refresh token)
4. Blacklist the access token: `SHA256(access_token)` inserted into `token_blacklist`
5. Insert to `logout_history`
6. Response clears the HttpOnly cookie
7. Frontend: `clearAuthStorage()` wipes memory + localStorage/sessionStorage

### Token Blacklist

Even though access tokens are short-lived (15 min), on logout they are explicitly blacklisted. The `JwtAuthGuard` checks the blacklist on every request. The table stores only the SHA256 hash — never the raw token.

### Refresh Session Table

Each login creates a row in `refresh_session`. Logout revokes it. Token refresh validates it is not revoked and not expired.

---

## 7. Auth Guard & Route Protection

### Backend: `JwtAuthGuard`

Applied to all protected routes. On every request:

1. Extract `Authorization: Bearer {token}` header
2. Verify JWT signature and expiry
3. **Reject if `type !== "access"`** — prevents using a refresh token as an access token
4. Check `token_blacklist` for SHA256(token)
5. Check `user_profile.account_status` — reject if `'Inactive'`
6. Attach decoded payload to `req.user`

### Frontend: `AuthGuard` Component

Wraps all dashboard pages. On mount:

1. Check if access token exists in memory
2. If not: attempt silent refresh via `POST /refresh`
3. If refresh fails: clear all storage + redirect to `/login`
4. Optional `allowedRoles` prop for role-based access control

---

## 8. Roles & Permissions (RBAC)

### Role Hierarchy

| Role            | Scope             | Typical Use          |
| --------------- | ----------------- | -------------------- |
| System Admin    | Platform-wide     | Manage all companies |
| Admin           | Company-scoped    | Manage company users |
| HR Officer      | Company-scoped    | Full HR access       |
| HR Recruiter    | Company-scoped    | Recruitment          |
| HR Interviewer  | Company-scoped    | Interviews           |
| Manager         | Department-scoped | Team management      |
| Active Employee | Self              | View own info        |
| Applicant       | Portal            | Job applications     |

### How It Works in Backend

Routes use two guards stacked together:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'System Admin')
@Post()
createUser() { ... }
```

`RolesGuard` reads `req.user.role_name` (from JWT) and checks if it's in the `@Roles(...)` decorator list.

### Multi-Tenancy

Every employee query is scoped by `company_id`. The `company_id` comes from the JWT — **never from the request body**. This prevents cross-company data leaks even if someone crafts a malicious request.

```typescript
// Example: only returns users from the requester's company
.eq('company_id', req.user.company_id)
```

---

## 9. Email Delivery

**Service:** Nodemailer with Gmail SMTP (`mail/mail.service.ts`)

**Configuration:**

- Host: `smtp.gmail.com`, Port: `465`, Secure: `true`
- Auth: Gmail account + App Password (from env vars `MAIL_USER`, `MAIL_PASS`)

### Email Types

**1. Employee Invite Email**

- Triggered by: Admin creates a new user
- Link: `/set-password?token={rawToken}` (48-hour expiry)
- Subject: "You have been invited to Blues Clues HRIS"

**2. Applicant Verification Email**

- Triggered by: Applicant completes registration
- Link: `/applicant/verify-email?token={rawToken}` (24-hour expiry)
- Subject: "Verify your email address"

**Dev Fallback:** If email sending fails (e.g. SMTP not configured), the link is printed to the backend console. This allows local testing without a real email account.

**Important:** Tokens are one-time use. Once `used_at` is set, the link is permanently invalid even if it hasn't expired.

---

## 10. Database Schema — Key Tables

```
user_profile
├── user_id          UUID (PK)
├── employee_id      text  ("empno-00001", auto-incremented per company)
├── email            text  (unique globally)
├── username         text  (unique globally)
├── password_hash    text  (NULL until invite claimed)
├── first_name       text
├── last_name        text
├── role_id          FK → role
├── company_id       FK → company  (multi-tenancy scope)
├── department_id    text (optional)
├── start_date       date  (login blocked if today < start_date)
├── account_status   text  → 'Pending' | 'Active' | 'Inactive'
└── created_at / updated_at

applicant_profile
├── applicant_id     UUID (PK)
├── applicant_code   text  ("APP-7654321", unique)
├── email            text  (unique)
├── password_hash    text
├── first_name       text
├── last_name        text
├── phone_number     text  (optional)
├── role             text  (always "Applicant")
├── status           text  → 'unverified' | 'active'
└── created_at

user_invites          (employee onboarding invite links)
├── invite_id        UUID (PK)
├── user_id          FK → user_profile
├── token_hash       text  (SHA256 of raw token)
├── expires_at       timestamp  (48h from creation)
└── used_at          timestamp  (NULL = not used yet)

email_verifications   (applicant email verification links)
├── verification_id  UUID (PK)
├── applicant_id     FK → applicant_profile
├── token_hash       text  (SHA256 of raw token)
├── expires_at       timestamp  (24h from creation)
└── used_at          timestamp  (NULL = not used yet)

refresh_session       (one row per active employee login session)
├── token_hash       text  (SHA256 of refresh JWT)
├── user_id          FK → user_profile
├── expires_at       timestamp
└── revoked_at       timestamp  (NULL = still valid)

token_blacklist       (access tokens that were explicitly logged out)
├── token_hash       text  (SHA256 of access JWT)
└── expires_at       timestamp

login_history
├── login_id         UUID (PK)
├── user_id          FK → user_profile
├── role_id          text
├── status           text  → 'SUCCESS' | 'FAILED'
├── ip_address       text
├── browser_info     text
└── created_at

logout_history
├── logout_id        UUID (PK)
├── login_id         UUID
├── user_id          FK → user_profile
├── session_id       UUID
├── ip_address       text
└── created_at
```

---

## 11. Key File Locations

### Backend (`tribeX-hris-auth-api/src/`)

| File                                  | Purpose                                            |
| ------------------------------------- | -------------------------------------------------- |
| `auth/auth.controller.ts`             | Login, logout, refresh, set-password routes        |
| `auth/auth.service.ts`                | Core auth logic — JWT generation, token validation |
| `auth/jwt-auth.guard.ts`              | Guard that validates every protected request       |
| `auth/roles.guard.ts`                 | RBAC enforcement based on role_name in JWT         |
| `auth/roles.decorator.ts`             | `@Roles(...)` decorator for controllers            |
| `users/users.controller.ts`           | Employee user CRUD (admin only)                    |
| `users/users.service.ts`              | User creation + invite token logic                 |
| `applicants/applicants.controller.ts` | Register, login, verify-email for applicants       |
| `applicants/applicants.service.ts`    | Applicant registration and email verification      |
| `mail/mail.service.ts`                | Email sending via Nodemailer                       |
| `supabase/supabase.service.ts`        | Supabase client setup                              |
| `auth/auth.module.ts`                 | JWT module config (secret, signOptions)            |

### Frontend (`frontend/blues-clues-hris-frontend-web/src/`)

| File                                           | Purpose                                                  |
| ---------------------------------------------- | -------------------------------------------------------- |
| `app/(auth)/login/page.tsx`                    | Employee login page                                      |
| `app/(portal)/applicant/login/page.tsx`        | Applicant portal — Sign In + Sign Up tabs                |
| `app/(portal)/applicant/verify-email/page.tsx` | Email verification landing page                          |
| `app/set-password/page.tsx`                    | Invite link — set initial password                       |
| `app/(dashboard)/system-admin/users/page.tsx`  | Admin user management UI                                 |
| `components/AuthGuard.tsx`                     | Client-side route protection wrapper                     |
| `lib/authApi.ts`                               | `loginApi`, `refreshApi`, `logoutApi`, `authFetch`       |
| `lib/authStorage.ts`                           | Token & user info read/write (memory + browser storage)  |
| `lib/adminApi.ts`                              | `createUser`, `getUsers`, `updateUser` (admin API calls) |
| `lib/api.ts`                                   | `API_BASE_URL` constant and base fetch config            |

---

## 12. Environment Variables

### Backend (`.env`)

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
JWT_SECRET=your-secret-must-be-at-least-32-chars
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-gmail-app-password
APP_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/tribeX/auth/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 13. End-to-End Request Examples

### Admin Creates an Employee

```http
POST /api/tribeX/auth/v1/users
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@company.com",
  "username": "john.doe",
  "role_id": "RID010",
  "department_id": "DEPT-HR",
  "start_date": "2024-07-01"
}

→ 201 Created
{
  "user_id": "abc-123-uuid",
  "employee_id": "empno-00042",
  "email": "john@company.com",
  "username": "john.doe"
}

→ Email sent to john@company.com:
  Link: https://app.com/set-password?token=a1b2c3...  (valid 48h)
```

### Applicant Registers

```http
POST /api/tribeX/auth/v1/applicants/register
Content-Type: application/json

{
  "first_name": "Maria",
  "last_name": "Santos",
  "email": "maria@example.com",
  "password": "MyPassword123",
  "phone_number": "+639171234567"
}

→ 201 Created
{
  "applicant_id": "def-456-uuid",
  "applicant_code": "APP-7654321",
  "email": "maria@example.com",
  "first_name": "Maria",
  "last_name": "Santos",
  "message": "Account created. Please check your email to verify your address."
}

→ Email sent to maria@example.com:
  Link: https://app.com/applicant/verify-email?token=x9y8z7...  (valid 24h)
```

### Applicant Verifies Email

```http
GET /api/tribeX/auth/v1/applicants/verify-email?token=x9y8z7...

→ 200 OK
{ "message": "Email verified successfully. You can now sign in." }
```

### Employee Logs In

```http
POST /api/tribeX/auth/v1/login
Content-Type: application/json

{
  "identifier": "john.doe",
  "password": "MyPassword123",
  "rememberMe": true
}

→ 200 OK
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

Set-Cookie: refresh_token=eyJ...; HttpOnly; Secure; Path=/api/tribeX/auth; MaxAge=2592000
```

### Decoded Access Token (Employee)

```json
{
  "type": "access",
  "sub_userid": "abc-123-uuid",
  "company_id": "COMP-001",
  "role_id": 3,
  "role_name": "HR Officer",
  "company_name": "Blue's Clues Inc.",
  "first_name": "John",
  "last_name": "Doe",
  "iat": 1741737600,
  "exp": 1741738500
}
```

### Token Refresh (Auto — no user action needed)

```http
POST /api/tribeX/auth/v1/refresh
(Cookie: refresh_token=eyJ... sent automatically by browser)

→ 200 OK
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

### Logout

```http
POST /api/tribeX/auth/v1/logout
Authorization: Bearer {access_token}
(Cookie: refresh_token=eyJ... sent automatically)

→ 200 OK
{ "message": "Logged out successfully." }
Set-Cookie: refresh_token=; MaxAge=0  (clears the cookie)
```

---

## Common Gotchas

- **Applicants cannot log in as employees.** The employee login page explicitly rejects JWTs with `role_name = "Applicant"`.
- **Employees cannot log in as applicants.** The applicant login route only queries `applicant_profile`, not `user_profile`.
- **Unverified applicants are blocked.** `status = 'unverified'` → login rejected with a clear error.
- **Invite tokens are one-time use.** Clicking the link again after setting a password will fail.
- **start_date blocks early logins.** An employee whose contract hasn't started yet cannot log in, even with correct credentials.
- **account_status is checked on every request** (not just login). If an admin deactivates a user mid-session, the next API call from that user will fail.
- **JWT_SECRET must be 32+ characters.** The backend throws on startup if it's too short.
- **Tokens are SHA256-hashed before DB storage.** Raw tokens are never persisted — this means if the DB is compromised, attackers cannot use stored hashes to authenticate.
