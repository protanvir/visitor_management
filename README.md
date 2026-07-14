# Visitor Management System

A robust, multi-site visitor management system for office and factory environments.

## Features

- **Visitor Registration**: Pre-registration and walk-in check-in
- **Host Management**: Employee directory and notifications
- **Digital Badges**: QR code-based visitor identification
- **Security**: Area-based access control and watchlist
- **Emergency**: Evacuation lists and safety checklists
- **Multi-Site**: Centralized management for multiple locations
- **Analytics**: Real-time dashboards and reporting

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Cache**: Redis
- **Containerization**: Docker, Docker Compose
- **Access**: Cloudflare Tunnel

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd visitor-management-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit the .env files with your configuration
```

### 4. Start the development environment

```bash
# Start database services
docker-compose -f docker/docker-compose.yml up -d postgres redis

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development servers
npm run dev
```

### 5. Access the applications

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Project Structure

```
visitor-management-system/
├── apps/
│   ├── web/                          # Next.js frontend
│   └── api/                          # Express backend
├── packages/
│   └── shared/                       # Shared types and utilities
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
├── docs/
│   ├── PLAN.md                       # Development plan
│   └── TASKS.md                      # Task tracking
└── package.json
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start all development servers
npm run build            # Build all packages
npm run lint             # Lint all packages

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
```

### Adding a new package

1. Create a new directory in `packages/`
2. Add a `package.json` with the name `@vms/<package-name>`
3. Add it to the `workspaces` array in the root `package.json`
4. Run `npm install` from the root

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

### Cloudflare Tunnel Setup

1. Install cloudflared
2. Authenticate with Cloudflare
3. Create a tunnel
4. Configure the tunnel to route to your services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
