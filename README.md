# Next.js Boilerplate

A modern Next.js 15 boilerplate with authentication and CRUD functionality.

## Features

- Next.js 15 with App Router
- Authentication with Better-Auth (Email + Google OAuth)
- PostgreSQL with Drizzle ORM
- Tailwind CSS + shadcn/ui
- TypeScript

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment variables**
   Create `.env.local`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/db_name"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   BETTER_AUTH_SECRET="your-secret-key"
   ```

3. **Start database**
   ```bash
   docker-compose up -d
   ```

4. **Setup database**
   ```bash
   pnpm db:push
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm dev` - Development server
- `pnpm build` - Build for production
- `pnpm lint` - Run linter
- `pnpm db:push` - Push database schema
- `pnpm db:studio` - Open database studio