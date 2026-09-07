# Ticket Flow — Backend

REST API for an internal maintenance request system. Staff submit and manage tickets; customers track their requests without an account.

Built with NestJS, TypeORM, PostgreSQL, and Firebase Authentication.

## Tech stack

- **NestJS** — API framework
- **TypeORM** — ORM and migrations
- **PostgreSQL** — database
- **Firebase Admin SDK** — token verification and user management
- **Swagger** — auto-generated API docs at `/api`

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Firebase project with Authentication enabled

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ticketflow
PORT=3000
```

### 3. Firebase service account

Download your Firebase service account key from **Firebase Console → Project settings → Service accounts → Generate new private key** and save it as `firebase-service-account.json` in the project root.

> This file is gitignored and must never be committed.

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Seed the admin user

```bash
npm run seed:admin
```

This creates an admin account in Firebase and the database. After running, go to **Firebase Console → Authentication → Users**, find the admin email, and set a password manually.

### 6. Start the server

```bash
npm run start:dev
```

The API runs at `http://localhost:3000`. Swagger docs are available at `http://localhost:3000/api`.

## Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start in watch mode |
| `npm run start:prod` | Start compiled build |
| `npm run build` | Compile TypeScript |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:generate` | Generate a new migration from entity changes |
| `npm run seed:admin` | Create the initial admin user |

## Roles

| Role | Access |
|---|---|
| `admin` | Full access — manage agents, categories, all tickets |
| `agent` | Assigned tickets, reply and resolve |
| Customer | No account — track tickets by email + reference number |
