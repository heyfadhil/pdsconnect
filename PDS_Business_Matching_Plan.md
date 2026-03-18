# PDS Business Matching System — Project Plan

**Version:** 2.0
**Date:** March 18, 2026
**Author:** Fadhil

---

## 1. Project Overview

**PDS Connect** is a web-based **Business Matching System** that facilitates structured meetings between **Buyers** and **Procurers** at organised events. Admins create events, manage participants, and oversee the matching process. The platform handles the full lifecycle: from event creation → participant invitation → mutual matching → meeting scheduling.

The public-facing entry point is a **landing page** at the root URL (`/`) that introduces the platform, its purpose, and its key features. Interested companies can submit an enquiry directly from the landing page, which notifies the admin team to follow up and onboard them manually.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| Backend/API | Next.js API Routes (or Server Actions) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Email | Resend (via Supabase triggers or API routes) |
| File Storage | Supabase Storage (company logos, Excel uploads) |
| Deployment | Vercel |
| Styling | Tailwind CSS |
| Excel Parsing | `xlsx` / `exceljs` npm package |
| AI | Google Gemini API (client uses Google Workspace) |

---

## 3. User Roles & Permissions

### 3.1 Admin Side (3 tiers)

| Role | Permissions |
|---|---|
| **Super Admin** | Full access. Can create/manage Admin and Staff accounts. Can delete events. |
| **Admin** | Can create events, upload Excel sheets, manage users, view all matches and reports. Cannot manage other admin accounts. |
| **Staff** | Can view dashboards, manage matches, manage individual users. Cannot create events, upload Excel, or touch role/admin settings. |

### 3.2 End Users (2 types)

| Role | Description |
|---|---|
| **Buyer** | Browses Procurer profiles, initiates match requests. |
| **Procurer** | Reviews incoming match requests from Buyers, confirms or declines. Schedules the meeting time slot. |

> End users have a **single persistent account** (email + password) managed by Supabase Auth. When admin creates their account, a welcome email is sent with a temporary password or password-reset link. The same credentials work across all events — users simply see whichever events they've been assigned to.

---

## 4. Core Features

### 4.1 Admin Panel

#### Event Management
- Create an event with:
  - Event name, description
  - **Event thumbnail image** — uploaded by admin, displayed on event cards in user dashboards to make events more visually appealing
  - Physical event date range (e.g., March 10–11 — the actual in-person days)
  - **Matchup window**: separate open/close dates for when users can browse and request matches online (e.g., opens March 3, closes March 11)
  - Venue name and location (set by admin, shown to matched users)
  - Pre-set available time slots for meetings (e.g., 10:00–10:30, 10:30–11:00…)
  - Categories (e.g., "Technology", "Food & Beverage")
  - Tags (e.g., "SME", "Export-ready", "Local")
  - **Max matches per Buyer** *(optional — leave blank for no cap)*
  - **Max matches per Procurer** *(optional — leave blank for no cap)*
- Edit and deactivate events
- Set event status: `Draft` → `Live` → `Closed`
- Once the matchup window closes, matching is disabled; the event becomes **Archived** (read-only for users)

#### User Database Management
- Upload Excel sheet to upsert the user database
  - If email exists → update their info
  - If new email → create new user record and Supabase Auth account
  - Excel columns: `name`, `email`, `company_name`, `role (buyer/procurer)`, `website_url`, `industry`, `bio`, `logo_url (optional)`
- View, search, filter, edit, and deactivate individual users
- **Industry** and **Tags** are admin-only fields:
  - Industry: dropdown selection from a global master list (admin can add new industries anytime from admin settings)
  - Tags: comma-separated free-text field (e.g. "SME, Export-ready, Local")
  - End users cannot edit these — only bio, logo, website URL (see Section 4.2/4.3)

#### Industries & Tags Master List (Admin Settings)
- Admin manages a global master list of **Industries** (e.g. Technology, Food & Beverage, Manufacturing)
- New industries can be added at any time from admin settings — immediately available across all user profiles and events
- Tags are free-form and not governed by a master list

#### Account Creation & Welcome Email
- Users created via **Excel upload or manually by admin**: account created immediately in Supabase Auth, welcome email sent automatically with a password-reset link
- Users originating from an **enquiry form submission**: follow a separate approval flow (see Section 5.3) — account is created but held as `inactive` until admin manually sends the welcome email after their intro meeting
- Admin can re-send the welcome/reset email at any time from the user management page
- **Admin password reset**: admin can trigger a forced password reset for any user from the admin panel (in case the user is locked out)
- No per-event passwords — one set of credentials works across all events the user is assigned to

#### AI-Assisted Event Participant Assignment
When assigning users to an event, admin triggers an AI-powered review flow:

1. Admin provides the event context (name, description, target industries/tags, goals) — either already filled from event creation or entered manually here
2. System sends the event context + full user database to **Gemini API**
3. For each user, Gemini reads:
   - Company name, industry, tags, and bio (from Supabase)
   - **Website content** (fetched live from the user's website URL for richer context)
4. Gemini generates per user:
   - An **AI Summary** — 1–2 sentences on why this user is relevant to the event
   - A **Relevance Score** — a percentage (0–100%) reflecting how strong the fit is
5. Results are returned as two tabs for admin review:
   - **"Confirmed Matches" tab** — users Gemini scores as highly relevant (typically ≥70%)
   - **"Might Be Related" tab** — users with partial or indirect relevance (typically <70%)
6. Each row displays: company name, industry, tags, relevance score badge (colour-coded: green ≥70%, orange 40–69%, red <40%), and AI Summary
7. Table is **sortable by relevance score** by default
8. Admin can: tick all, deselect individual users, manually dismiss users from either tab (dismissed users do not reappear), or move users between tabs
9. Admin can also **search the full user list** to manually add any user not surfaced by Gemini
10. Admin presses **"Add Selected to Event"** — selected users are assigned and notified
11. AI Summaries and scores are **freshly generated per event run** (not cached) — ensures each summary reflects the specific event context
12. Summaries are **not auto-regenerated** when a user's profile changes; they update only on the next event assignment run
13. Admin can also **manually add users** to the event at any time after the initial batch (e.g. late joiners)

#### Matching Oversight
- View all match requests, confirmed matches, and scheduled meetings per event
- Match statuses visible in admin: `Pending` / `Awaiting Buyer` / `Negotiating` / `Scheduled` / `Declined` / `Cancelled`
- **Negotiating matches** that have exceeded the reminder threshold are **flagged with a warning icon** in the admin panel
- Admin also receives an **email notification** when a match has been stalled past the reminder threshold
- Admin can manually intervene: cancel a match, reassign a time slot, or contact both parties
- Auto-cancelled matches are logged with reason `auto_cancelled_timeout`

#### Event-Wide Itinerary (Admin)
- Admin can view a **master schedule** for any event — all confirmed meetings across all participants, grouped by event day and time slot
- Shows: time slot | Buyer company | Procurer company | venue/table
- Admin can **cancel or reassign a meeting** directly from this view (clicks into the match row to modify)
- Read-only by default; edit actions open a confirmation dialog before applying changes

#### Admin Dashboard Overview
- Live stats widgets showing across all active events:
  - Total active matches (Pending + Awaiting Buyer + Negotiating)
  - Total scheduled meetings
  - **Stalled negotiations count** (⚠️ widget — negotiations that have exceeded 24hr)
- Sidebar nav shows a **live badge** on "Matches" with the count of stalled negotiations
- Clicking the stalled widget navigates directly to the filtered matches view

#### System Settings (Super Admin only)
Managed from `/admin/settings`. All values serve as platform-wide defaults; event-level settings always take precedence where applicable.

| Setting | Description |
|---|---|
| **Negotiation reminder threshold** | Hours before sending the stall reminder email (default: 24hr) |
| **Negotiation auto-cancel threshold** | Hours before auto-cancelling a stalled negotiation (default: 48hr) |
| **Default max matches — Buyer** | Pre-fills the match cap when creating a new event (admin can override) |
| **Default max matches — Procurer** | Pre-fills the match cap when creating a new event (admin can override) |
| **Default matchup window length** | Number of days before the event that the matchup window opens by default |
| **Admin notification email recipients** | One or more email addresses that receive system alerts (stalled negotiations, new enquiries, auto-cancels) |

- Admin can also **manually extend** the timer on any individual stalled negotiation directly from the match panel (+12hr, +24hr, or +48hr)

#### Reporting
- Export match report per event (Excel/CSV): who matched with whom, meeting times
- Participation stats: how many buyers/procurers active, match rate, etc.

---

### 4.2 Buyer Dashboard

- Login with email + password (single persistent account)
- **Event switcher** on dashboard: see all assigned events as `Active` (matchup window open) or `Archived` (matchup window closed / event ended — read-only)
- For each Active event: browse **Procurer** profiles in a **card grid layout**
- Cards are filtered to show only Procurers whose **industry or tags overlap** with the Buyer's own profile — keeping results focused and relevant
  - If the Buyer has **no overlapping matches** in the event, the page falls back to showing **all Procurers** in the event, so they're never left with an empty screen
- A **search bar** (by company name) and **filter panel** (industry dropdown + tag multi-select chips) are available at the top of the page
- Each card shows:
  - Company logo + name
  - Industry (badge)
  - Tags (pill chips)
  - Bio snippet (truncated, ~2 lines)
  - **"Request Match"** button — inline on the card
    - Shows as "Requested" (disabled) if already sent
    - Disabled entirely if Buyer has reached the event's max match cap
  - **"View Profile"** button — opens a **large centered modal (~70% screen width)** with full profile details: logo, company name, industry, tags, full bio, website URL, highlighted products (with thumbnails), and PDF catalogues. Request Match button at the bottom mirrors the card state exactly
- Cards are displayed in a responsive grid (3-col desktop, 2-col tablet, 1-col mobile)
- **Notification badge** on dashboard/matches tab when a match status changes (confirmed, scheduled, declined)
- **Matches page** displays match statuses as **card-style entries** with two tabs:
  - **"In Progress" tab** — `Pending`, `Awaiting Buyer`, `Negotiating`
  - **"Completed" tab** — `Scheduled`, `Declined`, `Cancelled`
- Each card shows: counterpart company info, current status badge, and relevant action buttons
  - `Pending` — Buyer can **Cancel Request**
  - `Awaiting Buyer` — Buyer must **Accept**, **Reject**, or **Suggest New Time**
  - `Negotiating` — shows the proposed slot with a countdown timer; Buyer can **Accept** or **Counter-propose**
  - `Scheduled` — shows confirmed date, time, venue (read-only); also visible in **My Schedule**
  - `Declined` / `Cancelled` — no actions, display only
- **My Schedule page** — a dedicated per-event daily itinerary view:
  - Grouped by event day (e.g. Day 1: March 10, Day 2: March 11)
  - Each confirmed meeting shown as a row: time slot | counterpart company name | venue/table
  - Read-only; updates automatically as new meetings are confirmed
  - Only shows `Scheduled` meetings (confirmed by both parties)
  - **Export to PDF** button — generates a clean, print-ready itinerary PDF for the user to download or print on event day
- **Negotiation timer rules:**
  - If the other party hasn't responded within **24 hours** → both Buyer and Procurer receive a reminder email
  - If still no response after **48 hours** → match is **auto-cancelled**, both parties notified by email, time slot freed up (was never held — remains open throughout)
- When Buyer selects **"Suggest New Time"**: they pick from available admin-defined time slots; Procurer is notified and can **Accept** or **Counter-propose** another slot
- Back-and-forth continues with **no round limit** — 24/48hr timer resets on each new suggestion
- Multiple matches allowed per event (up to admin-set cap)
- **Edit Profile** page: can update bio, logo, and website URL — changes apply globally across all events
  - Industry and Tags are **read-only** for end users (admin-managed only)
- **Change Password** available from profile page; "Forgot Password" link also available on login page

---

### 4.3 Procurer Dashboard

- Login with email + password (single persistent account)
- **Event switcher** on dashboard: see all assigned events as `Active` or `Archived`
- For each Active event: browse **Buyer** profiles in a **card grid layout** (same design and filtering logic as Buyer's Discover page)
- Cards are filtered to show only Buyers whose **industry or tags overlap** with the Procurer's own profile
  - Falls back to showing **all Buyers** in the event if no overlapping matches exist
- Same search bar + filter panel available
- **"View Profile"** button opens a **large centered modal** with full profile details (same layout as Buyer's view — includes highlighted products and catalogues)
- **"Ready to Match" inbox** — list of Buyers who have requested to match with them
  - Declined requests are **hidden** from the active inbox (not shown to reduce clutter); accessible only in a separate history/log view
- For each pending request: **Confirm** or **Decline**
- When confirmed:
  - Procurer selects an available **time slot** (pre-set by admin for the event)
  - Buyer is notified and must **Accept**, **Reject**, or **Suggest New Time**
  - If Buyer suggests a new time → Procurer can **Accept** the suggestion or **Counter-propose** another available slot
  - Back-and-forth continues with no round limit until both agree or one party cancels
  - Once both agree: slot is BOOKED, confirmation email sent to both with date, time, venue
- **Matches page** uses the same card-style layout and two-tab structure as Buyer
  - **"In Progress"**: `Pending` (incoming requests), `Awaiting Buyer`, `Negotiating`
  - **"Completed"**: `Scheduled`, `Declined`, `Cancelled`
  - `Negotiating` cards show the proposed slot, a countdown timer, and Accept / Counter-propose actions
  - 24hr reminder and 48hr auto-cancel apply equally to Procurer — timer resets on each new suggestion
- **My Schedule page** — same daily itinerary view as Buyer (per event, grouped by day, showing confirmed meetings, with PDF export)
- **Notification badge** when new match requests or time suggestions arrive
- View all confirmed/scheduled meetings per event
- Multiple matches/meetings allowed per event (up to admin-set cap)
- **Edit Profile** page: can update bio, logo, and website URL — changes apply globally across all events
  - Industry and Tags are **read-only** for end users (admin-managed only)
- **Change Password** available from profile page; "Forgot Password" link available on login page

---

## 5. Landing Page — PDS Connect

### 5.1 Purpose
The landing page is the **public face** of the PDS Connect platform. It is accessible to anyone without login, and serves two goals:
1. **Introduce** the system — what it is, how it works, and who it's for
2. **Convert** interested companies into enquiries for the admin team to follow up on

### 5.2 Page Structure & Sections

#### Navbar (sticky top)
- PDS Connect logo (left)
- Navigation links: `Home`, `How It Works`, `About`, `Contact`
- **"Login" button** (right) → links to `/login`

#### Hero Section
- Bold headline and subheadline introducing PDS Connect
- Brief value proposition (1–2 sentences)
- CTA button: **"Get Started"** → scrolls to the Interest Form at the bottom
- Optional: hero illustration or background image (TBD — branding to be confirmed)

#### What Is PDS Connect?
- Short paragraph describing the platform
- Highlight the two participant types: Buyers and Procurers
- Emphasise the structured, event-based approach to business matching

#### How It Works (3-step visual)
1. **Register Your Interest** — Submit your company info to the admin team
2. **Get Invited to an Event** — Admin creates your account and assigns you to a relevant event
3. **Match & Meet** — Browse counterparts, request matches, and schedule meetings

#### Key Features / Benefits
- Feature cards highlighting: event-based matching, structured scheduling, admin-managed security, and email-driven workflow
- TBD: icons and layout to be defined during branding phase

#### "Interested to Join?" Form (bottom CTA section)
- Section header: e.g. *"Want to be part of the next event?"*
- Form fields:
  - Full Name *(required)*
  - Company Name *(required)*
  - Email Address *(required)*
  - Phone Number *(optional)*
  - Role Interest: `Buyer` / `Procurer` / `Not sure yet` *(dropdown, required)*
  - Message / How did you hear about us? *(textarea, optional)*
- Submit button: **"Send Enquiry"**
- On submit:
  - Form data saved to `enquiries` table in Supabase
  - Email notification sent to admin (Resend) with full form details
  - User sees a success message: *"Thank you! Our team will be in touch shortly."*

#### Footer
- PDS Connect branding + copyright
- Links: Privacy Policy, Terms of Use (placeholders for now)
- Admin login link (subtle, e.g. small text link)

### 5.3 Enquiry Handling (Admin Side)
- Admin receives an email notification for each new enquiry
- Admin can view all enquiries in the admin panel under a new **Enquiries** section
- Enquiry statuses: `New` → `Contacted` → `Account Created` → `Onboarded` → `Rejected`
- The intended flow:
  1. Enquiry submitted → admin notified → status set to `New`
  2. Admin reviews and reaches out to the company offline → status updated to `Contacted`
  3. Admin decides to onboard → clicks **"Create Account"** → Supabase Auth account created, status → `Account Created`
     - Account is **inactive** at this stage — no welcome email sent yet
     - User cannot log in until welcome email is sent
  4. Admin has their intro meeting with the company
  5. When ready, admin clicks **"Send Welcome Email"** from the user's profile → password-reset link sent → status → `Onboarded`
  6. User sets their password and gains full access
- No self-registration — all account creation is admin-controlled

### 5.4 Design & Branding
- **TBD** — Branding, colour palette, typography, and visual design to be confirmed separately
- Landing page will be built as a Next.js page (`/app/page.tsx`) with Tailwind CSS
- Fully responsive (desktop + mobile)

---

## 6. Matching Flow (Step-by-Step)

```
1.  Admin creates event → sets venue, matchup window dates, time slots, match cap
2.  Admin triggers AI Assignment → provides event context → Gemini analyses all users
3.  Admin reviews "Confirmed Matches" + "Might Be Related" tabs, reads AI Summaries,
    ticks desired users → presses "Add to Event"
4.  System assigns selected users:
    - New users (never had an account): create Supabase Auth account → send welcome email
    - Existing users: assign to event → send "You've been added to an event" notification
    - Enquiry-sourced users: assign to event → welcome email sent manually by admin later
5.  Admin can add late-joining users to the event at any time
6.  Matchup window OPENS → event appears as "Active" on user dashboards
7.  Buyer logs in → selects the active event → browses Procurer profiles → clicks "Request Match"
8.  Procurer logs in → sees Buyer in "Ready to Match" inbox → Confirms or Declines
9.  If Declined → request hidden from Procurer inbox; Buyer notified via email
    Buyer can also Cancel their own request at any time while it is still Pending
    If auto-cancelled (48hr timeout) → Buyer may send a fresh match request to the same Procurer immediately (no cooldown)
10. If Confirmed → Procurer selects a time slot from available admin-defined options
11. Buyer receives notification → can Accept, Reject, or Suggest New Time (from available slots)
12. If Buyer suggests a new time → Procurer can Accept or Counter-propose another slot
    (Back-and-forth repeats with no round limit until both agree or one party cancels)
13. Once both agree → slot is BOOKED; both receive confirmation email (date, time, venue)
14. Matchup window CLOSES → event moves to "Archived" (read-only for users)
13. Admin/Staff can monitor all matches and meetings throughout in the admin panel
```

---

## 7. Database Schema (Supabase / PostgreSQL)

### `enquiries`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| full_name | text | |
| company_name | text | |
| email | text | |
| phone | text | Nullable |
| role_interest | enum | `buyer`, `procurer`, `unsure` |
| message | text | Nullable |
| status | enum | `new`, `contacted`, `account_created`, `onboarded`, `rejected` |
| user_id | uuid (FK → users) | Populated once account is created from this enquiry |
| created_at | timestamp | |

### `industries`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | Unique — e.g. "Technology", "Food & Beverage" |
| created_at | timestamp | |

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Supabase Auth UID |
| email | text | Unique |
| name | text | |
| company_name | text | |
| role | enum | `buyer`, `procurer`, `admin`, `staff`, `superadmin` |
| website_url | text | User-editable |
| industry_id | uuid (FK → industries) | Admin-managed only |
| tags | text | Comma-separated string — admin-managed only |
| bio | text | User-editable |
| logo_url | text | Supabase Storage URL — user-editable |
| ai_summary | text | Gemini-generated profile summary (last generated, for reference) |
| is_active | boolean | False until welcome email sent (for enquiry-sourced users) |
| welcome_sent | boolean | Tracks whether welcome email has been dispatched |
| created_at | timestamp | |

### `events`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| description | text | |
| venue_name | text | |
| venue_address | text | |
| thumbnail_url | text | Supabase Storage URL — event card image uploaded by admin |
| event_start_date | date | Physical event start (in-person days) |
| event_end_date | date | Physical event end |
| matchup_open_date | date | When users can start browsing + requesting matches |
| matchup_close_date | date | When matchup closes (typically = event_end_date) |
| max_matches_per_buyer | integer | Nullable — no cap if null |
| max_matches_per_procurer | integer | Nullable — no cap if null |
| status | enum | `draft`, `live`, `closed` |
| created_by | uuid (FK → users) | Admin who created |
| created_at | timestamp | |

### `event_categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_id | uuid (FK → events) | |
| name | text | e.g. "Technology" |

### `event_tags`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_id | uuid (FK → events) | |
| name | text | e.g. "SME", "Export-ready" |

### `ai_assignment_results`
Stores the output of each Gemini assignment run per event, so results persist between admin sessions.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_id | uuid (FK → events) | |
| user_id | uuid (FK → users) | |
| ai_summary | text | Event-specific Gemini summary |
| relevance_score | integer | 0–100 |
| tab | enum | `confirmed`, `might_be_related` |
| dismissed | boolean | True if admin manually dismissed |
| created_at | timestamp | When this run was generated |

### `event_participants`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_id | uuid (FK → events) | |
| user_id | uuid (FK → users) | |
| role_in_event | enum | `buyer`, `procurer` |
| categories | text[] | Categories assigned for this event |
| tags | text[] | Tags assigned for this event |
| is_active | boolean | |

### `time_slots`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_id | uuid (FK → events) | |
| start_time | timestamp | |
| end_time | timestamp | |
| is_booked | boolean | Default false |

### `match_requests`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_id | uuid (FK → events) | |
| buyer_id | uuid (FK → users) | |
| procurer_id | uuid (FK → users) | |
| status | enum | `pending`, `awaiting_buyer`, `negotiating`, `scheduled`, `declined`, `cancelled` |
| time_slot_id | uuid (FK → time_slots) | Most recently proposed/agreed slot |
| cancel_reason | text | Nullable — e.g. `auto_cancelled_timeout`, `buyer_rejected`, `buyer_cancelled` |
| created_at | timestamp | |
| updated_at | timestamp | |

### `time_negotiations`
Tracks the back-and-forth time slot proposals between Buyer and Procurer after initial confirmation.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| match_request_id | uuid (FK → match_requests) | |
| proposed_by | enum | `buyer`, `procurer` |
| time_slot_id | uuid (FK → time_slots) | Proposed slot — not held/blocked during negotiation |
| status | enum | `pending`, `accepted`, `rejected`, `countered`, `auto_cancelled` |
| reminder_sent_at | timestamp | Nullable — when 24hr reminder email was sent |
| expires_at | timestamp | 48hr after `created_at` by default; updated when admin extends the timer |
| extension_hours | integer | Nullable — how many hours admin added (12, 24, or 48) |
| extended_by | uuid (FK → users) | Nullable — admin who applied the extension |
| created_at | timestamp | |

### `products`
Global product library per seller. Products can be reused across events.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | Seller who owns this product |
| name | text | Product name |
| description | text | Nullable |
| thumbnail_url | text | Supabase Storage URL |
| created_at | timestamp | |

### `event_products`
Per-event product highlights — which products a seller is showcasing at a specific event.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_id | uuid (FK → events) | |
| user_id | uuid (FK → users) | Seller |
| product_id | uuid (FK → products) | |
| display_order | integer | For ordering within the modal |
| UNIQUE | (event_id, product_id) | No duplicate highlights |

### `catalogues`
Global PDF catalogue library per seller.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | Seller who owns this catalogue |
| name | text | Display name (e.g. "2026 Product Catalogue") |
| file_url | text | Supabase Storage URL (PDF) |
| created_at | timestamp | |

### `event_catalogues`
Per-event catalogue selection — which PDFs a seller attaches to a specific event.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_id | uuid (FK → events) | |
| user_id | uuid (FK → users) | Seller |
| catalogue_id | uuid (FK → catalogues) | |
| UNIQUE | (event_id, catalogue_id) | No duplicate attachments |

### `system_settings`
Stores platform-wide global configuration. Single-row table (one record for the whole platform).

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| negotiation_reminder_hours | integer | Default: 24 |
| negotiation_auto_cancel_hours | integer | Default: 48 |
| default_max_matches_buyer | integer | Nullable — no default cap if null |
| default_max_matches_procurer | integer | Nullable — no default cap if null |
| default_matchup_window_days | integer | Days before event that matchup opens by default |
| admin_notification_emails | text[] | Array of email addresses for system alerts |
| updated_by | uuid (FK → users) | Last Super Admin who updated settings |
| updated_at | timestamp | |

### `email_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| event_id | uuid (FK → events) | Nullable (e.g. welcome email is not event-specific) |
| type | enum | `welcome`, `event_assigned`, `match_request`, `match_confirmed`, `meeting_scheduled`, `match_declined`, `negotiation_reminder`, `negotiation_stalled_admin`, `negotiation_auto_cancelled` |
| sent_at | timestamp | |
| status | text | `sent`, `failed` |

---

## 8. Pages & Routes

### Public (`/`)
| Route | Page |
|---|---|
| `/` | Landing page — PDS Connect (intro, features, interest form) |
| `/login` | Unified login page (end users) |

### Admin Panel (`/admin/*`)
| Route | Page |
|---|---|
| `/admin/login` | Admin login |
| `/admin/dashboard` | Overview stats |
| `/admin/events` | List all events |
| `/admin/events/new` | Create event |
| `/admin/events/[id]` | Event detail + manage |
| `/admin/events/[id]/slots` | Manage time slots |
| `/admin/events/[id]/participants` | View/manage event participants |
| `/admin/events/[id]/matches` | View all matches for event |
| `/admin/events/[id]/itinerary` | Master event itinerary — all confirmed meetings by day/slot (read + reassign) |
| `/admin/events/[id]/calendar` | Calendar view — confirmed meetings in day/time grid, filterable by buyer/seller |
| `/admin/users` | Global user database |
| `/admin/users/upload` | Excel upload page |
| `/admin/users/[id]` | Edit individual user (incl. industry, tags, send welcome email) |
| `/admin/enquiries` | View and manage interest form submissions |
| `/admin/events/[id]/assign` | AI-assisted participant assignment (Confirmed + Might Be Related tabs) |
| `/admin/settings` | System settings (timer extension, other global config) |
| `/admin/settings/industries` | Manage global industries master list |
| `/admin/roles` | Manage admin/staff accounts (Super Admin only) |

### Buyer Dashboard (`/buyer/*`)
| Route | Page |
|---|---|
| `/buyer/dashboard` | Overview — Active & Archived events, notification badges |
| `/buyer/events/[id]/discover` | Browse Procurers for a specific event |
| `/buyer/events/[id]/matches` | Match cards — "In Progress" and "Completed" tabs |
| `/buyer/events/[id]/schedule` | My Schedule — daily itinerary of confirmed meetings |
| `/profile` | Edit profile (bio, logo, website URL) + change password |
| `/profile/products` | Manage global product library (add, edit, delete) |
| `/profile/catalogues` | Manage global PDF catalogue library |

### Procurer Dashboard (`/procurer/*`)
| Route | Page |
|---|---|
| `/procurer/dashboard` | Overview — Active & Archived events, notification badges |
| `/procurer/events/[id]/discover` | Browse Buyers for a specific event |
| `/procurer/events/[id]/inbox` | "Ready to Match" inbox for a specific event |
| `/procurer/events/[id]/matches` | Match cards — "In Progress" and "Completed" tabs |
| `/procurer/events/[id]/schedule` | My Schedule — daily itinerary of confirmed meetings |
| `/profile` | Edit profile (bio, logo, website URL) + change password |
| `/profile/products` | Manage global product library (add, edit, delete) |
| `/profile/catalogues` | Manage global PDF catalogue library |
| `/procurer/events/[id]/products` | Select which products to highlight for this event |
| `/procurer/events/[id]/catalogues` | Select which catalogues to attach to this event |

---

## 9. Email Notifications (via Resend)

| Trigger | Recipient | Content |
|---|---|---|
| Interest form submitted | Admin team | Full enquiry details (name, company, email, role interest, message) |
| New user account created (Excel/manual) | User (Buyer/Procurer) | Welcome email with password-reset link |
| New user from enquiry — admin manually triggers | User (Buyer/Procurer) | Welcome email with password-reset link (sent after admin's intro meeting) |
| Existing user assigned to new event | User (Buyer/Procurer) | "You've been added to a new event" notification (no new credentials) |
| Admin re-sends welcome / reset email | User | New password-reset link |
| Buyer requests match | Procurer | "A buyer wants to match with you" |
| Buyer cancels pending request | Procurer | "A buyer has withdrawn their match request" |
| Procurer confirms + selects time slot | Buyer | "Your match was confirmed — please accept or suggest a new time" |
| Procurer declines request | Buyer | "Your match request was declined" |
| Buyer rejects confirmed meeting | Procurer | "The buyer has rejected the meeting — match cancelled" |
| Buyer suggests new time slot | Procurer | "The buyer has suggested a new meeting time — please review" |
| Procurer accepts suggested time | Buyer | Meeting confirmed — date, time, venue, counterpart info |
| Procurer counter-proposes a time | Buyer | "The procurer has suggested a different time — please review" |
| Buyer accepts counter-proposed time | Both | Meeting confirmed — date, time, venue, counterpart info |
| Negotiation has no response for 24 hours | Both Buyer & Procurer | Reminder — "Your meeting negotiation is awaiting a response" |
| Negotiation has no response for 24 hours | Admin team | Flag email — "Match negotiation stalled: [Buyer] ↔ [Procurer]" |
| Negotiation auto-cancelled after 48 hours | Both Buyer & Procurer | "Your meeting was auto-cancelled due to no response" |

---

## 10. Security Considerations

- Single persistent account per user — passwords managed by Supabase Auth (hashed, never stored in plain text)
- New user accounts use a Supabase password-reset flow to set their initial password securely
- Row-Level Security (RLS) policies in Supabase to ensure:
  - Buyers/Procurers can only see event data for events they are assigned to
  - Users cannot view other users' personal details outside of the profile card
  - Staff cannot query admin role tables or user credentials
- Profile edits by end users are scoped to their own record only (RLS enforced)
- Matchup window enforced server-side — match requests rejected if submitted outside the window
- API routes protected by Supabase session middleware
- Excel uploads validated server-side (column names, data types, email format, role values)

---

## 11. Phased Development Roadmap

### Phase 0 — Landing Page ✅ Complete
- [x] Design branding (colours, typography, logo)
- [x] Build PDS Connect landing page (`/`)
- [x] Build "Interested to Join?" form with Supabase + Resend integration
- [x] Create `enquiries` table + admin enquiries view

### Phase 1 — Foundation ✅ Complete
- [x] Set up Next.js + Supabase project
- [x] Configure Supabase Auth (admin + end-user login flows)
- [x] Build database schema + RLS policies
- [x] Admin login + Super Admin seeding script

### Phase 2 — Admin Core ✅ Complete
- [x] Global industries master list + management page (`/admin/settings/industries`)
- [x] Event creation (with matchup window, time slots, venue, match caps)
- [x] Excel upload + upsert user logic (create Supabase Auth accounts for new users)
- [x] Welcome email + password-reset flow (Resend integration)
- [x] "Assigned to new event" notification email
- [x] Enquiry approval flow: Create Account (inactive) → Send Welcome Email manually
- [x] Admin password reset for any user

### Phase 2b — AI Assignment ✅ Complete
- [x] Gemini API integration
- [x] Website content fetcher (reads live website URL per user as context input)
- [x] Per-event AI run: generate summary + relevance score per user (fresh each run)
- [x] `ai_assignment_results` table to persist run output between admin sessions
- [x] AI-assisted event assignment page (`/admin/events/[id]/assign`)

### Phase 3 — End User Dashboards ✅ Complete
- [x] Login → dashboard with Active / Archived event switcher
- [x] Card grid browse page with search, filters, inline Request Match, View Profile modal
- [x] Buyer: cancel pending request; Accept / Reject / Suggest New Time on confirmed matches
- [x] Time negotiation loop with 24hr reminder + 48hr auto-cancel
- [x] Card-style Matches page with "In Progress" and "Completed" tabs
- [x] My Schedule page per event with PDF export
- [x] Procurer: Ready to Match inbox, confirm/decline, select time slot
- [x] Notification badges, profile edit, change password, forgot password
- [x] Full email notification suite

### Phase 4 — Admin Oversight ✅ Complete
- [x] Admin dashboard with live stats widgets + sidebar stalled badge
- [x] Match monitoring per event with ⚠️ stalled flags
- [x] Manual timer extension, auto-cancel job, System Settings page
- [x] Admin event-wide itinerary page
- [x] Staff vs Admin permission enforcement
- [x] Re-send welcome email, manual match intervention, admin password reset

### Phase 5 — Polish & Deploy ✅ Complete
- [x] Reporting + export (Excel/CSV)
- [x] UI polish, mobile-responsive
- [x] PDF generation (My Schedule export)
- [x] Vercel deployment
- [x] End-to-end testing

---

### Phase 6 — New Features (Current)

#### 6.1 — Seller Product Showcase
- [ ] Global product library per seller (`/profile/products`)
  - Add product: name, description, thumbnail image
  - Edit and delete products
  - Products stored in Supabase Storage (images)
- [ ] Per-event product selection — seller chooses which products to highlight for each event
  - From event dashboard: "Manage My Products for This Event"
  - Tick/untick from their global library
- [ ] Products visible in the company profile modal (buyer-facing)
  - Shown as thumbnail grid with product name below each image
  - Click thumbnail → expands to full product detail view within the modal

#### 6.2 — PDF Product Catalogues
- [ ] Global catalogue library per seller — upload one or more PDFs to their profile
- [ ] Per-event catalogue selection — seller chooses which catalogues to attach to each event
- [ ] Catalogues visible in the company profile modal (buyer-facing)
  - Listed as downloadable/viewable PDF links (📄 icon + filename)
  - Opens in-browser PDF viewer or downloads on click
- [ ] Admin can view a seller's catalogues from the user management page

#### 6.3 — Admin Calendar View
- [ ] Calendar view for admin at `/admin/events/[id]/calendar`
  - Shows all confirmed meetings in a day/time grid
  - Each meeting block shows: time slot, buyer name, seller name
  - Filter by seller (Procurer) — shows only their meetings on the calendar
  - Filter by buyer — shows only their meetings
- [ ] Clicking a meeting block opens a **quick popup** with:
  - Buyer company, Procurer company, time, venue/table
  - Quick actions: **Cancel** or **Reassign** (opens time slot picker)

#### 6.4 — Profile View → Centered Modal
- [ ] Replace right-side drawer with a **large centered modal (~70% screen width)**
- [ ] Modal sections (scrollable):
  1. Header: company logo, name, industry badge, website link
  2. Tags section
  3. Full bio
  4. Highlighted Products (thumbnail grid — event-specific selection)
  5. PDF Catalogues (downloadable links)
  6. Request Match button (pinned to bottom or footer of modal)

#### 6.5 — Event Thumbnail
- [ ] Admin can upload a **thumbnail image** when creating or editing an event
- [ ] Thumbnail displayed on event cards in user dashboards (Active & Archived event switcher)
- [ ] Makes the event list visually appealing and helps users quickly identify events
- [ ] Stored in Supabase Storage; `thumbnail_url` column added to `events` table

---

## 12. Resolved Decisions

| # | Question | Decision |
|---|---|---|
| 1 | Multiple simultaneous active events? | ✅ Yes — multiple events can be live at the same time. Matchup window (open/close dates) controls availability. Once closed, events become Archived (read-only). |
| 2 | Notification badges for match status changes? | ✅ Yes — both Buyers and Procurers see badges on their dashboard and matches tab. Auto-clears when user visits the matches page. |
| 3 | Can users edit their own profile? | ✅ Partially — users can edit bio, logo, and website URL. Industry and Tags are admin-only fields. Changes apply globally across all events. |
| 4 | Match cap per event? | ✅ Admin sets max matches per Buyer and per Procurer at event level. Optional — blank = no cap. |
| 5 | Declined matches in Procurer inbox? | ✅ Hidden from active inbox. Accessible in a separate history/log view only. |
| 6 | Event-specific passwords? | ❌ Removed — users have a single persistent account. Welcome email with password-reset link sent on account creation only. |
| 7 | Industry management | ✅ Global master list managed by admin (dropdown on user profiles). Admin can add new industries anytime. Tags remain free-text (comma-separated), admin-only. |
| 8 | Users can change their own password? | ✅ Yes — via profile page. Forgot Password link on login page. Admin can also trigger a reset from the admin panel. |
| 9 | Notification badge clear behaviour? | ✅ Auto-clears when user visits the matches page. No manual "mark as read" needed. |
| 10 | How are users assigned to events? | ✅ AI-assisted flow using Gemini API. Admin provides event context → Gemini fetches each user's website + reads their bio/industry/tags → generates a per-event AI Summary + Relevance Score (0–100%). Results shown in two tabs: "Confirmed Matches" (≥70%) and "Might Be Related" (<70%), sortable by score with colour-coded badges. Admin ticks, dismisses, or manually adds users. Fresh run per event. |
| 11 | Enquiry-to-account waitlist flow? | ✅ Enquiry approved → account created as inactive (no email sent) → admin has intro meeting → admin manually sends welcome email when ready → user sets password and gains access. |
| 12 | AI Summary regeneration trigger? | ✅ Fresh per event assignment run only. Not auto-triggered by profile changes. |
| 13 | "Might Be Related" tab — unticked users persist? | ✅ Stay unless manually dismissed. Admin can also search the full user list to add anyone not surfaced by AI. |
| 14 | Browse/Discover UI layout? | ✅ Card grid (3-col desktop, 2-col tablet, 1-col mobile). Each card: logo, company name, industry badge, tag chips, bio snippet. Inline "Request Match" button (shows "Requested" if already sent, disabled at cap). "View Profile" opens a **large centered modal** (~70% width) with full profile + Request Match button. *(Updated by Decision #39)* |
| 16 | Who do users see on the Discover page? | ✅ Only counterparts whose industry or tags overlap with their own profile. Not all event participants. |
| 17 | Discover page search & filters? | ✅ Search bar (by company name) + industry dropdown + tag multi-select chips. |
| 18 | Profile view style? | ✅ **Large centered modal** (~70% screen width) — replaces the original side drawer. Sections: logo/name, industry badge, tags, bio, highlighted products (thumbnail grid), PDF catalogues, Request Match button. *(Updated by Decision #39)* |
| 15 | AI reads website content? | ✅ Yes — Gemini fetches live website URL per user as additional context for summaries and scores. Fails gracefully if site is inaccessible. |
| 19 | No industry/tag matches on Discover page? | ✅ Falls back to showing all counterparts in the event — no empty screen. |
| 20 | Matches page layout? | ✅ Card-style entries with status badges. Statuses: Pending, Awaiting Buyer, Negotiating, Scheduled, Declined, Cancelled. |
| 21 | Can Buyers cancel a match request? | ✅ Yes — while status is Pending. After Procurer confirms, Buyer can Accept, Reject, or Suggest New Time. |
| 22 | Time slot negotiation after confirmation? | ✅ After Procurer picks a slot: Buyer can Accept, Reject (cancels), or Suggest New Time (must pick from available admin-defined slots). Procurer can Accept or Counter-propose. Unlimited rounds. Each suggestion tracked in `time_negotiations`. |
| 23 | Time slot held during negotiation? | ✅ Remains open — not held. Slot is only BOOKED once both parties agree. |
| 24 | Negotiation expiry timer? | ✅ 24hr → reminder email to both parties + admin flag email + dashboard warning icon. 48hr → auto-cancel, both parties notified, `cancel_reason = auto_cancelled_timeout`. Timer resets on each new suggestion. |
| 25 | Matches page tabs? | ✅ "In Progress" (Pending, Awaiting Buyer, Negotiating) and "Completed" (Scheduled, Declined, Cancelled). Negotiating cards show countdown timer. |
| 26 | Auto-cancel notification recipients? | ✅ Both Buyer and Procurer receive the auto-cancel email. Admin receives the 24hr stall flag (not the 48hr cancel). |
| 27 | Admin alert for stalled negotiation? | ✅ Email + dashboard flag (warning icon on the match row in admin panel). Triggered at 24hr mark. |
| 28 | Scheduled meetings on Completed tab? | ✅ Yes — Scheduled belongs in Completed tab. Users also have a dedicated "My Schedule" page per event showing a daily timeline (grouped by event day: time slot \| company \| venue/table). |
| 29 | Fresh match after auto-cancel? | ✅ Yes — Buyer can send a new request to the same Procurer after auto-cancel. Not permanently closed. |
| 30 | Admin can extend negotiation timer? | ✅ Yes — admin can manually extend any stalled negotiation by choosing +12hr, +24hr, or +48hr. Extension resets the reminder flag. Managed from System Settings / admin match panel. |
| 31 | Admin dashboard stalled count placement? | ✅ Dashboard overview widget (⚠️ Stalled count) + live badge on sidebar "Matches" nav item. Clicking navigates to filtered stalled matches view. |
| 32 | My Schedule exportable? | ✅ Yes — PDF export (print-ready itinerary). Available to both Buyers and Procurers from the My Schedule page. |
| 33 | Admin event-wide itinerary? | ✅ Yes — `/admin/events/[id]/itinerary` shows all confirmed meetings grouped by day and time slot. Admin can cancel or reassign meetings directly from this view (with confirmation dialog). |
| 34 | Re-request cooldown after auto-cancel? | ✅ No cooldown — Buyer can re-request immediately. |
| 35 | System Settings contents? | ✅ Negotiation reminder threshold, auto-cancel threshold, default match caps (buyer/procurer), default matchup window length, admin notification email recipients. All values are platform-wide defaults; event-level settings take precedence. |

| 36 | Product scope | ✅ Global product library per seller + per-event selection of which to highlight. |
| 37 | Catalogue scope | ✅ Global library per seller + per-event selection of which PDFs to attach to each event. |
| 38 | Admin calendar click behaviour | ✅ Quick popup with Buyer, Procurer, time, table + Cancel and Reassign actions. |
| 39 | Profile view style | ✅ Large centered modal (~70% screen width) replacing the side drawer. Sections: logo/name, tags, bio, highlighted products, catalogues, Request Match button. |
| 40 | Event thumbnail | ✅ Admin uploads a thumbnail image per event. Shown on event cards in user dashboards. |
| 41 | PDF itinerary — company logos? | ✅ Yes — counterpart's company logo is included in the PDF itinerary alongside name, time, and table details. |
| 42 | Reassign meeting — who is notified? | ✅ Both parties (Buyer and Procurer) are automatically notified by email when admin reassigns a meeting. |
| 43 | Admin notification email scope | ✅ Critical alerts only — stalled negotiations and new enquiries. No daily digest. |
| 44 | Audit trail for System Settings changes | ✅ Yes — all System Settings changes are logged (who changed what, when). |
| 45 | Catalogue view behaviour | ✅ Opens in browser new tab (inline PDF viewer). Not a forced download. |
| 46 | Product highlight cap per event | ✅ Unlimited by default. Admin can optionally set a maximum number of highlighted products per seller during event setup. |
| 47 | Calendar view placement | ✅ Sits alongside the existing itinerary table view as a togglable tab (not a replacement). Admin can switch between Table view and Calendar view. |

---

## 13. Open Questions / To Decide Later

_All current questions resolved. See Section 12 (Resolved Decisions #41–47)._

---

*Document will be updated as requirements evolve.*
