# Database Deployment Guide

## Prerequisites
- PostgreSQL database running
- DATABASE_URL configured in .env file

## Fresh Deployment

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Seed the database (optional)
npx tsx prisma/seed.ts
```

## Schema Changes

The current schema includes:
- **Organization** - Multi-tenant support
- **User** - Authentication with roles
- **Site** - Multi-site support with timezone
- **Employee** - Hosts with designation and department
- **Visitor** - Visitors with readable `visitorCode` (e.g., V-ABC123)
- **Visit** - Core tracking with status, check-in/out times
- **Badge** - Digital badges with QR codes
- **Notification** - Email/SMS notifications
- **Watchlist** - Block individuals
- **SafetyChecklist** - Factory safety compliance

## Key Fields

### Visitor.visitorCode
- Format: `V-ABC123` (6 alphanumeric chars)
- Used for quick identification and check-out
- Unique constraint prevents duplicates

### Employee.designation
- Optional field for job title (e.g., Manager, Engineer)
- Displayed in kiosk host selection

## Running Migrations

```bash
# Check migration status
npx prisma migrate status

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Deploy migrations to production
npx prisma migrate deploy
```

## Reset Database (Development Only)

```bash
npx prisma db push --force-reset
npx tsx prisma/seed.ts
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/vms_dev"
```

Optional SMS configuration:
```
ADNSMS_API_KEY=your_api_key
ADNSMS_API_SECRET=your_api_secret
ADNSMS_BASE_URL=https://api.adnsms.com
```
