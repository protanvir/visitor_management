# Aptech Group - VMS Troubleshooting Guide

## Table of Contents

1. [Common Issues](#common-issues)
2. [Database Issues](#database-issues)
3. [API Issues](#api-issues)
4. [Frontend Issues](#frontend-issues)
5. [Docker Issues](#docker-issues)
6. [SMS Issues](#sms-issues)
7. [Performance Issues](#performance-issues)
8. [Getting Help](#getting-help)

---

## Common Issues

### Application Won't Start

**Symptom**: Services fail to start after `npm run dev`

**Solution**:
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill processes using ports
taskkill /PID <process_id> /F

# Restart services
npm run dev
```

### Database Connection Error

**Symptom**: `Error: Can't reach database server`

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose -f docker/docker-compose.yml ps

# Restart PostgreSQL
docker-compose -f docker/docker-compose.yml restart postgres

# Check logs
docker-compose -f docker/docker-compose.yml logs postgres
```

### Authentication Errors

**Symptom**: `401 Unauthorized` on API calls

**Solution**:
1. Ensure you're logged in
2. Check if token is valid (not expired)
3. Verify Authorization header format: `Bearer <token>`

---

## Database Issues

### Migration Failures

**Symptom**: `Error: Migration failed`

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
cd apps/api
npx prisma migrate reset

# Or push schema without migration
npx prisma db push
```

### Connection Pool Exhausted

**Symptom**: `Error: Too many database connections`

**Solution**:
```bash
# Check connection count
docker-compose -f docker/docker-compose.yml exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Restart PostgreSQL
docker-compose -f docker/docker-compose.yml restart postgres
```

### Slow Queries

**Symptom**: API responses are slow

**Solution**:
1. Check database indexes
2. Use EXPLAIN ANALYZE to identify slow queries
3. Add missing indexes in Prisma schema

```sql
-- Check slow queries
SELECT * FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 seconds';
```

---

## API Issues

### Port Already in Use

**Symptom**: `Error: listen EADDRINUSE`

**Solution**:
```bash
# Find process using port
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <pid> /F

# Or use different port
set API_PORT=3002
npm run dev
```

### CORS Errors

**Symptom**: `Access-Control-Allow-Origin` error in browser

**Solution**:
1. Check CORS_ORIGIN in `.env`
2. Ensure frontend URL is allowed
3. Restart API server

### Rate Limiting

**Symptom**: `429 Too Many Requests`

**Solution**:
1. Wait 15 minutes for rate limit reset
2. Reduce request frequency
3. Contact admin to increase limits

### Request Too Large

**Symptom**: `413 Payload Too Large`

**Solution**:
- API accepts up to 10MB by default
- For larger payloads, update Express config

---

## Frontend Issues

### Build Errors

**Symptom**: `npm run build` fails

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try build again
npm run build
```

### Hydration Errors

**Symptom**: `Hydration failed because initial UI does not match`

**Solution**:
1. Ensure `"use client"` is added to client components
2. Check for browser-only code
3. Use `useEffect` for client-side logic

### Stale Data

**Symptom**: UI shows outdated information

**Solution**:
1. Hard refresh (Ctrl+F5)
2. Clear browser cache
3. Check API responses for correct data

---

## Docker Issues

### Containers Won't Start

**Symptom**: Docker containers keep restarting

**Solution**:
```bash
# Check container logs
docker-compose -f docker/docker-compose.yml logs <service>

# Check container status
docker-compose -f docker/docker-compose.yml ps

# Restart all services
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up -d
```

### Volume Permission Issues

**Symptom**: `Permission denied` in containers

**Solution**:
```bash
# Fix volume permissions
docker-compose -f docker/docker-compose.yml down
docker volume rm docker_postgres_data
docker-compose -f docker/docker-compose.yml up -d
```

### Out of Disk Space

**Symptom**: `no space left on device`

**Solution**:
```bash
# Clean Docker images
docker system prune -a

# Clean volumes
docker volume prune
```

---

## SMS Issues

### SMS Not Sending

**Symptom**: SMS notifications not received

**Solution**:
1. Check ADNSMS credentials in `.env`
2. Verify phone number format (8801XXXXXXXXX)
3. Check SMS balance via API
4. Review API logs for errors

### Invalid Phone Number

**Symptom**: `INVALID_NUMBER` error

**Solution**:
1. Ensure format: `8801XXXXXXXXX` (13 digits)
2. Remove spaces, dashes, or special characters
3. Use the validate-phone endpoint to check

### Insufficient Balance

**Symptom**: `INSUFFICIENT_BALANCE` error

**Solution**:
1. Check balance: `GET /api/sms/balance`
2. Top up ADNSMS account
3. Use bulk SMS for better rates

---

## Performance Issues

### Slow API Response

**Symptom**: API takes > 2 seconds to respond

**Solution**:
1. Check database query performance
2. Add missing indexes
3. Enable Redis caching
4. Check server resources

### High Memory Usage

**Symptom**: Server running out of memory

**Solution**:
1. Check for memory leaks
2. Restart services periodically
3. Increase server memory
4. Optimize database queries

### Database Slow

**Symptom**: Database queries are slow

**Solution**:
```bash
# Analyze table statistics
docker-compose -f docker/docker-compose.yml exec postgres psql -U postgres -d vms_dev -c "ANALYZE;"

# Check table sizes
docker-compose -f docker/docker-compose.yml exec postgres psql -U postgres -d vms_dev -c "SELECT pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
```

---

## Getting Help

### Check Logs

```bash
# API logs
docker-compose -f docker/docker-compose.yml logs api

# Database logs
docker-compose -f docker/docker-compose.yml logs postgres

# All logs
docker-compose -f docker/docker-compose.yml logs
```

### Health Check

```bash
# Check API health
curl http://localhost:3001/health

# Check database
docker-compose -f docker/docker-compose.yml exec postgres pg_isready
```

### Contact Support

- **Email**: support@aptechgroup.com
- **Phone**: +8801712345682
- **Emergency**: +8801712345682

---

*Last updated: July 2026*
*Company: Aptech Group*
