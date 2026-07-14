# Aptech Group - VMS Developer Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Development Setup](#development-setup)
5. [Database](#database)
6. [API Development](#api-development)
7. [Frontend Development](#frontend-development)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Contributing](#contributing)

---

## Architecture Overview

The Aptech Group Visitor Management System uses a modern monorepo architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                  │
│  Kiosk │ Dashboard │ Visitors │ Host │ Reports │ Admin  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend API (Express)                 │
│  Auth │ Visitors │ Visits │ Reports │ Notifications     │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
┌──────────────────┐ ┌──────────┐ ┌──────────────┐
│   PostgreSQL     │ │  Redis   │ │   ADNSMS     │
│   (Database)     │ │ (Cache)  │ │   (SMS)      │
└──────────────────┘ └──────────┘ └──────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14, React 18, TypeScript | User interface |
| Styling | Tailwind CSS, shadcn/ui | Design system |
| Backend | Node.js, Express, TypeScript | API server |
| Database | PostgreSQL 16, Prisma ORM | Data persistence |
| Cache | Redis 7 | Session & data caching |
| SMS | ADNSMS | Bangladesh SMS gateway |
| Container | Docker, Docker Compose | Deployment |
| CI/CD | GitHub Actions | Automated pipeline |

---

## Project Structure

```
vms/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                  # App router pages
│   │   │   ├── components/           # React components
│   │   │   └── lib/                  # Utilities
│   │   ├── public/                   # Static assets
│   │   └── package.json
│   │
│   └── api/                          # Express backend
│       ├── src/
│       │   ├── routes/               # API routes
│       │   ├── services/             # Business logic
│       │   ├── middleware/           # Express middleware
│       │   └── __tests__/           # Tests
│       ├── prisma/
│       │   ├── schema.prisma        # Database schema
│       │   └── seed.ts              # Seed data
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared types & utils
│       ├── src/
│       │   └── types/               # TypeScript types
│       └── package.json
│
├── docker/
│   ├── Dockerfile.web               # Web app Dockerfile
│   ├── Dockerfile.api               # API Dockerfile
│   ├── docker-compose.yml           # Docker Compose config
│   ├── backup.sh                    # Database backup script
│   ├── restore.sh                   # Database restore script
│   ├── deploy.sh                    # Deployment script
│   └── rollback.sh                  # Rollback script
│
├── docs/                            # Documentation
│   ├── API-REFERENCE.md             # API documentation
│   ├── USER-GUIDE.md               # User guide
│   ├── DEVELOPER-GUIDE.md          # This file
│   └── DEPLOYMENT.md               # Deployment guide
│
├── .github/workflows/               # CI/CD
│   └── ci-cd.yml
│
├── package.json                     # Root package.json
├── turbo.json                       # Turborepo config
└── jest.config.js                   # Jest config
```

---

## Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd vms

# Install dependencies
npm install

# Start database services
docker-compose -f docker/docker-compose.yml up -d postgres redis

# Setup database
cd apps/api
cp .env.example .env
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# Start development servers
cd ../..
npm run dev
```

### Environment Variables

See `.env.example` in `apps/api/` for required variables.

---

## Database

### Schema

The database uses PostgreSQL with Prisma ORM. Key models:

- **Organization**: Top-level entity
- **Site**: Physical locations
- **Employee**: Hosts/users
- **Visitor**: External visitors
- **Visit**: Visit records
- **Badge**: Digital badges
- **Notification**: Email/SMS notifications
- **User**: Authentication users

### Common Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name <name>

# Seed database
npx tsx prisma/seed.ts

# Open Prisma Studio
npx prisma studio
```

---

## Frontend Components

### Photo Capture

Location: `apps/web/src/components/photo/PhotoCapture.tsx`

Usage:
```tsx
import PhotoCapture from "@/components/photo/PhotoCapture";

<PhotoCapture
  onCapture={(photoData) => console.log(photoData)}
  width={400}
  height={300}
/>
```

### QR Scanner

Location: `apps/web/src/components/qr/QRScanner.tsx`

Usage:
```tsx
import QRScanner from "@/components/qr/QRScanner";

<QRScanner
  onScan={(data) => handleQRScan(data)}
  isActive={scannerActive}
/>
```

### Badge Components

Location: `apps/web/src/components/badges/`

- **BadgeDisplay.tsx**: Main badge display with QR code
- **BadgeRefresh.tsx**: Auto-refresh controls
- **BadgeShare.tsx**: Share badge via Email/SMS/Link

Usage:
```tsx
import BadgeDisplay from "@/components/badges/BadgeDisplay";
import BadgeRefresh from "@/components/badges/BadgeRefresh";
import BadgeShare from "@/components/badges/BadgeShare";

<BadgeDisplay visitId={visitId} />
<BadgeRefresh visitId={visitId} onRefresh={refreshBadge} />
<BadgeShare visitId={visitId} badgeUrl={url} visitorName={name} />
```

---

## API Development

### Adding New Routes

1. Create route file in `apps/api/src/routes/`
2. Import and register in `apps/api/src/index.ts`

```typescript
// Example route
import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
```

### Middleware

Available middleware in `apps/api/src/middleware/security.ts`:

- `cspMiddleware` - Content Security Policy
- `securityHeadersMiddleware` - Security headers
- `inputSanitizationMiddleware` - Input sanitization
- `sqlInjectionPrevention` - SQL injection protection

---

## Frontend Development

### Adding New Pages

1. Create directory in `apps/web/src/app/`
2. Add `page.tsx` file

### Components

- Use `btn-corporate`, `card-corporate`, `input-corporate` classes
- Follow Aptech Group design system (navy #102a43)

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Writing Tests

Create test files in `__tests__/` directories:

```typescript
import request from "supertest";
import app from "../index";

describe("API Endpoint", () => {
  it("should return success", async () => {
    const res = await request(app).get("/api/endpoint");
    expect(res.status).toBe(200);
  });
});
```

---

## Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose -f docker/docker-compose.yml up -d --build

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

### Production Deployment

```bash
# On production server
cd /opt/vms
./docker/deploy.sh
```

---

## Contributing

1. Create feature branch from `develop`
2. Make changes
3. Write tests
4. Submit PR to `develop`
5. After review, merge to `main`

---

*Last updated: July 2026*
*Company: Aptech Group*
