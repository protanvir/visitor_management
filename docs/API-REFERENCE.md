# Aptech Group - Visitor Management System API Documentation

## Overview

This document provides comprehensive documentation for the Aptech Group Visitor Management System API.

**Base URL**: `http://localhost:3001` (development) | `https://your-domain.com` (production)

**Version**: 1.0.0

**Authentication**: JWT Bearer token (for protected endpoints)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Visitors](#visitors)
3. [Visits](#visits)
4. [Employees/Hosts](#employees)
5. [Sites](#sites)
6. [Badges](#badges)
7. [Areas](#areas)
8. [Safety](#safety)
9. [NDA](#nda)
10. [Notifications](#notifications)
11. [Reports](#reports)
12. [SMS](#sms)
13. [Audit](#audit)

---

## Authentication

### Login

**POST** `/api/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "admin@aptechgroup.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@aptechgroup.com",
      "name": "Admin User",
      "role": "admin",
      "organization": {
        "id": "uuid",
        "name": "Aptech Group"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

### Register

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@aptechgroup.com",
  "name": "New User",
  "password": "password123",
  "organizationId": "uuid",
  "role": "user"
}
```

### Get Profile

**GET** `/api/auth/me`

Get current user profile. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

---

## Visitors

### Get All Visitors

**GET** `/api/visitors`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 10)
- `search` (string): Search by name, email, or company
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): asc or desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### Get Visitor by ID

**GET** `/api/visitors/:id`

### Create Visitor

**POST** `/api/visitors`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+8801712345678",
  "company": "Example Corp"
}
```

### Update Visitor

**PUT** `/api/visitors/:id`

### Delete Visitor

**DELETE** `/api/visitors/:id`

---

## Visits

### Get All Visits

**GET** `/api/visits`

**Query Parameters:**
- `page`, `pageSize`: Pagination
- `status`: Filter by status (pending, approved, checked_in, checked_out, cancelled)
- `visitorType`: Filter by type (guest, contractor, vendor, delivery, interview)
- `siteId`: Filter by site
- `hostId`: Filter by host
- `startDate`, `endDate`: Date range filter

### Create Visit (Pre-registration)

**POST** `/api/visits`

**Request Body:**
```json
{
  "visitorId": "uuid",
  "hostId": "uuid",
  "siteId": "uuid",
  "purpose": "Business meeting",
  "visitorType": "guest",
  "expectedArrival": "2024-01-01T09:00:00Z"
}
```

### Check In Visitor

**POST** `/api/visits/checkin`

**Request Body:**
```json
{
  "visitorId": "uuid",
  "hostId": "uuid",
  "siteId": "uuid",
  "purpose": "Business meeting"
}
```

### Check Out Visitor

**POST** `/api/visits/:id/checkout`

### Approve Visit

**POST** `/api/visits/:id/approve`

### Reject Visit

**POST** `/api/visits/:id/reject`

**Request Body:**
```json
{
  "reason": "Host unavailable"
}
```

### Get Active Visitors

**GET** `/api/visits/current/active`

### Get Evacuation List

**GET** `/api/visits/evacuation/list`

### Auto Check-out

**POST** `/api/visits/auto-checkout`

**Request Body:**
```json
{
  "maxDurationHours": 8
}
```

### Extend Visit

**POST** `/api/visits/:id/extend`

**Request Body:**
```json
{
  "additionalHours": 2,
  "reason": "Meeting running long"
}
```

### Get Time Statistics

**GET** `/api/visits/stats/time`

**Query Parameters:**
- `siteId`: Filter by site
- `period`: day, week, month

---

## Employees

### Get All Employees

**GET** `/api/employees`

### Get Employee by ID

**GET** `/api/employees/:id`

### Check Host Availability

**GET** `/api/employees/:id/availability`

**Query Parameters:**
- `date`: Date to check (YYYY-MM-DD)

### Get Host Visitor History

**GET** `/api/employees/:id/history`

### Get Current Visitors

**GET** `/api/employees/:id/current-visitors`

### Get Pending Approvals

**GET** `/api/employees/:id/pending-approvals`

### Bulk Approve Visits

**POST** `/api/employees/bulk-approve`

**Request Body:**
```json
{
  "visitIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

## Sites

### Get All Sites

**GET** `/api/sites`

### Get Site by ID

**GET** `/api/sites/:id`

### Create Site

**POST** `/api/sites`

### Update Site

**PUT** `/api/sites/:id`

### Delete Site

**DELETE** `/api/sites/:id`

### Get Site Statistics

**GET** `/api/sites/:id/statistics`

---

## Badges

### Get All Badges

**GET** `/api/badges`

**Query Parameters:**
- `siteId`: Filter by site
- `status`: active, returned, overdue

### Get Badge by Visit ID

**GET** `/api/badges/visit/:visitId`

### Return Badge

**POST** `/api/badges/return`

**Request Body:**
```json
{
  "visitId": "uuid",
  "returnedBy": "Staff Name",
  "notes": "Optional notes"
}
```

### Get Overdue Badges

**GET** `/api/badges/overdue`

### Get Badge Return History

**GET** `/api/badges/history`

---

## Areas

### Get All Areas

**GET** `/api/areas`

### Check Access

**POST** `/api/areas/check-access`

**Request Body:**
```json
{
  "areaId": "area-1",
  "visitorId": "uuid",
  "visitId": "uuid"
}
```

### Get Access Logs

**GET** `/api/areas/logs/access`

### Get Area Occupancy

**GET** `/api/areas/:id/occupancy`

---

## Safety

### Get Checklist Templates

**GET** `/api/safety/templates`

### Get Checklist for Visit

**GET** `/api/safety/visit/:visitId`

### Update Checklist Item

**POST** `/api/safety/visit/:visitId/item/:itemId`

**Request Body:**
```json
{
  "completed": true
}
```

### Complete Checklist

**POST** `/api/safety/visit/:visitId/complete`

---

## NDA

### Get NDA Template

**GET** `/api/nda/template`

### Get NDA Status

**GET** `/api/nda/visit/:visitId`

### Sign NDA

**POST** `/api/nda/visit/:visitId/sign`

**Request Body:**
```json
{
  "visitorName": "John Doe",
  "visitorEmail": "john@example.com",
  "signature": "John Doe",
  "agreeToTerms": true
}
```

### Download Signed NDA

**GET** `/api/nda/visit/:visitId/download`

---

## Notifications

### Get Notifications for Visit

**GET** `/api/notifications/visit/:visitId`

### Resend Notification

**POST** `/api/notifications/:id/resend`

### Send Check-out Reminder

**POST** `/api/notifications/reminder/:visitId`

---

## Reports

### Get Statistics

**GET** `/api/reports/statistics`

### Get Dashboard Data

**GET** `/api/reports/dashboard`

### Export CSV

**GET** `/api/reports/export/csv`

### Export PDF/HTML

**GET** `/api/reports/export/pdf`

### Get Visitor History

**GET** `/api/reports/visitor-history/:visitorId`

---

## SMS (ADNSMS)

### Send Single SMS

**POST** `/api/sms/send`

**Request Body:**
```json
{
  "to": "01712345678",
  "message": "Your message here"
}
```

### Send Bulk SMS

**POST** `/api/sms/send-bulk`

**Request Body:**
```json
{
  "recipients": ["01712345678", "01812345678"],
  "message": "Your message here",
  "campaignTitle": "Optional campaign title"
}
```

### Check Balance

**GET** `/api/sms/balance`

### Validate Phone Number

**POST** `/api/sms/validate-phone`

**Request Body:**
```json
{
  "phone": "+8801712345678"
}
```

### Get SMS Templates

**GET** `/api/sms/templates`

### Send Test SMS

**POST** `/api/sms/test`

**Request Body:**
```json
{
  "phone": "01712345678"
}
```

---

## Audit

### Get Audit Logs

**GET** `/api/audit`

**Query Parameters:**
- `page`, `pageSize`: Pagination
- `action`: Filter by action type
- `entityType`: Filter by entity type
- `startDate`, `endDate`: Date range

### Get Audit Statistics

**GET** `/api/audit/stats/summary`

### Export Audit Logs

**GET** `/api/audit/export/csv`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- **General API**: 200 requests per 15 minutes
- **Auth endpoints**: 20 requests per 15 minutes

---

## Security Headers

- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

---

*Last updated: July 2026*
*Company: Aptech Group*
