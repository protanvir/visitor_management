# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

All API endpoints require authentication via JWT token.

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Visitors

#### Get All Visitors

```
GET /visitors
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 10)
- `search` (string): Search by name, email, or company
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order - asc or desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "company": "Acme Inc",
        "photoUrl": "url",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

#### Get Visitor by ID

```
GET /visitors/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Inc",
    "photoUrl": "url",
    "visits": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create Visitor

```
POST /visitors
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Inc",
  "photoUrl": "url"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Inc",
    "photoUrl": "url",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Visitor created successfully"
}
```

#### Update Visitor

```
PUT /visitors/:id
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Visitor updated successfully"
}
```

#### Delete Visitor

```
DELETE /visitors/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Visitor deleted successfully"
}
```

---

### Visits

#### Get All Visits

```
GET /visits
```

**Query Parameters:**
- `page` (number): Page number
- `pageSize` (number): Items per page
- `status` (string): Filter by status - pending, approved, checked_in, checked_out, cancelled
- `visitorType` (string): Filter by type - guest, contractor, vendor, delivery, interview
- `siteId` (string): Filter by site
- `hostId` (string): Filter by host
- `startDate` (string): Filter by start date (ISO format)
- `endDate` (string): Filter by end date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "visitor": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "host": {
          "id": "uuid",
          "name": "Jane Smith",
          "email": "jane@company.com"
        },
        "site": {
          "id": "uuid",
          "name": "Main Office"
        },
        "purpose": "Business meeting",
        "visitorType": "guest",
        "checkInTime": "2024-01-01T09:00:00.000Z",
        "checkOutTime": null,
        "status": "checked_in",
        "createdAt": "2024-01-01T08:50:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

#### Get Visit by ID

```
GET /visits/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "visitor": {...},
    "host": {...},
    "site": {...},
    "purpose": "Business meeting",
    "visitorType": "guest",
    "checkInTime": "2024-01-01T09:00:00.000Z",
    "checkOutTime": null,
    "status": "checked_in",
    "badge": {
      "id": "uuid",
      "qrCode": "data:image/png;base64,...",
      "expiresAt": "2024-01-01T17:00:00.000Z"
    },
    "notifications": [...],
    "createdAt": "2024-01-01T08:50:00.000Z"
  }
}
```

#### Create Visit (Pre-registration)

```
POST /visits
```

**Request Body:**
```json
{
  "visitorId": "uuid",
  "hostId": "uuid",
  "siteId": "uuid",
  "purpose": "Business meeting",
  "visitorType": "guest",
  "expectedArrival": "2024-01-01T09:00:00.000Z",
  "expectedDeparture": "2024-01-01T17:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "createdAt": "2024-01-01T08:50:00.000Z"
  },
  "message": "Visit created successfully"
}
```

#### Check In Visitor

```
POST /visits/:id/checkin
```

**Request Body:**
```json
{
  "qrCode": "optional-qr-code-for-pre-registered"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "checkInTime": "2024-01-01T09:00:00.000Z",
    "status": "checked_in",
    "badge": {
      "id": "uuid",
      "qrCode": "data:image/png;base64,...",
      "expiresAt": "2024-01-01T17:00:00.000Z"
    }
  },
  "message": "Visitor checked in successfully"
}
```

#### Check Out Visitor

```
POST /visits/:id/checkout
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "checkOutTime": "2024-01-01T15:00:00.000Z",
    "status": "checked_out",
    "duration": "6h 0m"
  },
  "message": "Visitor checked out successfully"
}
```

#### Approve Visit

```
POST /visits/:id/approve
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "updatedAt": "2024-01-01T08:55:00.000Z"
  },
  "message": "Visit approved successfully"
}
```

#### Reject Visit

```
POST /visits/:id/reject
```

**Request Body:**
```json
{
  "reason": "Host unavailable"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "updatedAt": "2024-01-01T08:55:00.000Z"
  },
  "message": "Visit rejected successfully"
}
```

---

### Employees/Hosts

#### Get All Employees

```
GET /employees
```

**Query Parameters:**
- `page` (number): Page number
- `pageSize` (number): Items per page
- `search` (string): Search by name or email
- `siteId` (string): Filter by site
- `department` (string): Filter by department

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "email": "jane@company.com",
        "department": "Engineering",
        "role": "employee",
        "site": {
          "id": "uuid",
          "name": "Main Office"
        }
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2
  }
}
```

#### Get Employee by ID

```
GET /employees/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@company.com",
    "department": "Engineering",
    "role": "employee",
    "site": {...},
    "hostedVisits": [...]
  }
}
```

---

### Notifications

#### Get Notifications for Visit

```
GET /visits/:id/notifications
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "email",
      "recipient": "jane@company.com",
      "subject": "Visitor Arrival",
      "message": "John Doe has arrived to see you",
      "status": "sent",
      "sentAt": "2024-01-01T09:00:05.000Z"
    }
  ]
}
```

#### Resend Notification

```
POST /notifications/:id/resend
```

**Response:**
```json
{
  "success": true,
  "message": "Notification resent successfully"
}
```

---

### Reports

#### Get Visitor Statistics

```
GET /reports/statistics
```

**Query Parameters:**
- `siteId` (string): Filter by site
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVisits": 150,
    "averageDuration": "4h 30m",
    "peakHour": 10,
    "visitsByType": {
      "guest": 80,
      "contractor": 40,
      "vendor": 20,
      "delivery": 10
    },
    "visitsByDay": {
      "2024-01-01": 25,
      "2024-01-02": 30
    }
  }
}
```

#### Export Visits

```
GET /reports/export
```

**Query Parameters:**
- `format` (string): csv or pdf
- `siteId` (string): Filter by site
- `startDate` (string): Start date
- `endDate` (string): End date

**Response:**
- CSV: Returns CSV file
- PDF: Returns PDF file

---

### Sites

#### Get All Sites

```
GET /sites
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Main Office",
      "address": "123 Main St",
      "timezone": "America/New_York",
      "settings": {
        "requireNDA": true,
        "safetyChecklist": false
      }
    }
  ]
}
```

#### Create Site

```
POST /sites
```

**Request Body:**
```json
{
  "name": "Factory Location",
  "address": "456 Industrial Ave",
  "timezone": "America/Chicago",
  "settings": {
    "requireNDA": true,
    "safetyChecklist": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Factory Location",
    "address": "456 Industrial Ave",
    "timezone": "America/Chicago",
    "settings": {
      "requireNDA": true,
      "safetyChecklist": true
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Site created successfully"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid request body"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```
