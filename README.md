# BiteNearby

Location-based mess discovery and reservation platform. Students find nearby mess kitchens, browse daily menus, and reserve meals in real time. Mess owners manage their menu and track reservations from a dedicated dashboard.

## Features

**For Students**
- Location-based mess discovery using the browser Geolocation API and the Haversine formula for accurate distance calculation
- Interactive Leaflet map showing nearby messes alongside a sortable list view
- Real-time menu lookup (day/night meals) with dish details and pricing
- Instant meal reservation with a 2-hour cancellation cutoff before mealtime
- View and cancel personal reservations

**For Mess Owners**
- Mess registration with a pin-drop map and address search (OpenStreetMap Nominatim geocoding)
- Menu management — add, edit, and delete dishes for day and night meals
- View daily reservations grouped by meal type

**Platform**
- Role-based JWT authentication (Student / Mess Owner) with Bcrypt password hashing
- Automated daily cleanup via cron jobs — expired menus and reservations are purged, attendance counters reset at midnight
- Relational PostgreSQL schema with foreign key constraints, cascade deletes, and uniqueness constraints preventing duplicate enrollments and double-bookings

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, shadcn/ui, Framer Motion, React Leaflet |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT, Bcrypt |
| Scheduling | node-cron |

## Architecture

```
BiteNearby/
├── frontend/          React + Vite client
│   ├── src/
│   │   ├── pages/          Landing, Auth, Dashboard, OwnerDashboard, MyReservations
│   │   ├── components/     Reusable UI (MessCard, MenuPanel, LocationPicker, shared)
│   │   ├── context/        AuthContext (JWT/session state)
│   │   ├── hooks/          useGeolocation
│   │   └── lib/            api.js (axios instance), validation (Zod schemas)
│   └── .env                VITE_API_URL
│
└── backend/           Express REST API
    ├── config/         PostgreSQL connection pool
    ├── models/         Query layer (db.js)
    ├── routes/          auth, mess, menu, enrollment, reservation
    ├── middleware/      JWT auth middleware
    ├── cron/            Daily cleanup jobs
    └── .env             DB credentials, JWT secret, PORT
```

## Database Schema

Core entities and relationships:

```
users ──┬── enrollments ──── messes ──┬── mess_owners
        │                             │
        └── reservations ─────────────┤
                                       ├── dishes ── dish_items
                                       └── menus ── menu_dishes
```

- **Reservations are decoupled from specific dishes/menus** — a reservation secures a meal slot (mess + meal type + date), so menu changes don't invalidate existing bookings.
- **Cascade deletes** are scoped deliberately: `menu_dishes` and `dish_items` cascade from their parent dish/menu (pure junction/detail data), while `messes`, `users`, and `enrollments` use `NO ACTION` since no current feature deletes those entities — an intentional choice to avoid accidental silent data loss.
- **Uniqueness constraints** enforce business rules at the database level, not just in application code: one enrollment per user per mess, and one reservation per user per meal type per day (across all messes).

## Setup

### Prerequisites
- Node.js
- PostgreSQL (running locally or accessible remotely)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bitenearby
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

Create the database and run the schema (see `/db/schema.sql` if included, or refer to the Database Schema section above for table structure).

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/user/signup` \| `/login` | Student auth |
| POST | `/api/auth/messowner/signup` \| `/login` | Mess owner auth |
| POST | `/api/mess/create` | Register a mess (owner only) |
| GET | `/api/mess/nearby` | Geolocation-based nearby search |
| GET | `/api/mess/my-mess` | Get owner's registered mess |
| POST | `/api/menu/dish` | Add a dish |
| PATCH \| DELETE | `/api/menu/dish/:id` | Edit / remove a dish (owner, with ownership check) |
| GET | `/api/menu/menu/:messId/:date` | Fetch a mess's menu for a date |
| POST | `/api/enrollment/join` | Enroll in a mess |
| POST | `/api/reservation/book` | Reserve a meal |
| DELETE | `/api/reservation/:id` | Cancel a reservation (2-hour cutoff enforced) |
| GET | `/api/reservation/my-reservations/:date` | Student's reservations |
| GET | `/api/reservation/mess/:messId/:date` | Owner view of a day's reservations |

All mutating routes are protected by JWT middleware and role checks; dish edit/delete additionally verifies the requesting owner actually owns the mess the dish belongs to.

## Notable Engineering Decisions

- **Geolocation search** uses the Haversine formula implemented directly in SQL via a subquery (computing distance as a derived column, filtered in the outer query — PostgreSQL doesn't allow filtering on a `HAVING`-computed alias without `GROUP BY`).
- **Timezone handling**: overrode the `pg` driver's default `DATE` type parser to return raw strings instead of JS `Date` objects, avoiding a UTC/IST day-shift bug on date-only columns.
- **SMOTE-style thinking applied to auth**: role is established once at signup via a JWT claim, never trusted from client input on subsequent requests — every mutating route re-validates `req.user.role` server-side.
- **Known limitation**: mess owner signup has no identity verification step (e.g., document upload, manual approval) — any account can self-register as a mess owner. Role-based *authorization* is fully enforced; owner *identity verification* was treated as out of scope for this project's timeline.

## Author

Sumant Khalatkar
