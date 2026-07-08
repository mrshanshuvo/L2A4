# Express Prisma Stripe Zod Boilerplate

A production-ready, type-safe Express.js backend boilerplate integrated with PostgreSQL, Prisma, Zod request validation, and optional Stripe payments.

## Features

- **TypeScript**: Full static typing and modern compilation.
- **Express.js**: Fast, unopinionated, minimalist web framework.
- **Prisma ORM**: Modern database access with type-safety and multi-file schema management.
- **Zod Validation**: Request payload validation (Zod v4) with unified error responses.
- **Startup Environment Variable Validation**: Immediate failure on startup if critical configuration is missing.
- **Authentication**: JWT-based access and refresh token authentication with role-based route guard middleware.
- **Stripe Payments Ready**: Complete library setup, raw body parser middleware for Stripe webhooks, and proxy run script.
- **Global Error Handling**: Comprehensive parsing of Prisma query, validation, connection, and general server exceptions.

---

## Directory Structure

```text
src/
├── config/              # Centralized environment variable config & startup validation
├── lib/                 # Core library clients (Prisma, Stripe)
├── middlewares/         # Express middlewares (auth, globalErrorHandler, notFound, validateRequest)
├── modules/             # App features (user, auth)
│   ├── auth/            # Auth controller, routing, and schema validations
│   └── user/            # User registration & profile management
├── utils/               # Shared helpers (catchAsync, jwt, sendResponse)
├── app.ts               # Express application configuration
└── server.ts            # Entrypoint file starting database & web server
prisma/
├── schema/              # Multi-file database model definitions
└── seed.ts              # Database seeding script (default admin & user accounts)
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Duplicate the template file and fill in your values (database URLs, JWT secrets, Stripe secrets):

```bash
cp .env.example .env
```

### 3. Generate Prisma Client

Build the database models and generate TypeScript types:

```bash
npx prisma generate
```

### 4. Push Database Schema

Sync your database structure with the Prisma schema:

```bash
npx prisma db push
```

### 5. Seed the Database

Populate your database with default Admin (`admin@example.com` / `admin123`) and User (`user@example.com` / `user123`) accounts:

```bash
npx prisma db seed
```

### 6. Start the Server

#### Development Mode (auto-reload on change):

```bash
npm run dev
```

#### Production Mode (build & run compiled js):

```bash
npm run build
npm start
```

### 7. Run Stripe Webhook Proxy (Optional)

If using Stripe webhooks locally, listen and forward events to your endpoint:

```bash
npm run stripe:webhook
```
