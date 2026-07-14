# Aptech Group - Visitor Management System User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Visitor Check-In](#visitor-check-in)
4. [Host Dashboard](#host-dashboard)
5. [Admin Dashboard](#admin-dashboard)
6. [Badge Management](#badge-management)
7. [Safety & Security](#safety--security)
8. [Emergency Procedures](#emergency-procedures)
9. [Reports & Analytics](#reports--analytics)
10. [FAQ](#faq)

---

## Introduction

Welcome to the Aptech Group Visitor Management System (VMS)! This system helps manage visitor access, track attendance, and ensure security across all Aptech Group facilities.

### Key Features

- **Self-Service Check-In**: Visitors can check in using the kiosk
- **Digital Badges**: QR code-based visitor identification
- **Real-Time Notifications**: Instant alerts to hosts
- **Safety Compliance**: NDA signing and safety briefings
- **Emergency Management**: Evacuation lists and emergency alerts
- **Multi-Site Support**: Manage multiple locations from one dashboard

---

## Getting Started

### For Visitors

1. **Arrive at Reception**: Approach the self-service kiosk or inform the receptionist
2. **Start Check-In**: Tap "Start Check-In" on the kiosk screen
3. **Enter Your Details**: Provide your name, email, and company
4. **Select Host**: Choose the person you're visiting
5. **Complete Check-In**: Receive your digital badge

### For Hosts

1. **Receive Notification**: Get notified when your visitor arrives
2. **Greet Visitor**: Meet them at the reception area
3. **Manage Visits**: Use the host dashboard to track and manage visitors

### For Administrators

1. **Login**: Access the admin dashboard at http://localhost:3000/login
2. **Monitor Activity**: View real-time visitor statistics
3. **Manage Settings**: Configure sites, employees, and access rules

---

## Visitor Check-In

### Using the Kiosk (Self-Service)

1. **Welcome Screen**: Tap "Start Check-In"
2. **Your Information**:
   - Enter your full name (required)
   - Enter email address (optional)
   - Enter phone number (optional)
   - Enter company name (optional)
3. **Select Host**:
   - Search for your host by name
   - Select the purpose of your visit
4. **Confirm Details**: Review your information
5. **Complete**: Receive your digital badge with QR code

### Walk-In Registration (Receptionist)

1. **Create Visitor**: Add visitor details in the system
2. **Select Host**: Choose the host they're visiting
3. **Check-In**: Complete the check-in process
4. **Print Badge**: Badge is displayed on screen for scanning

### Pre-Registered Visitors

If the host pre-registered you:
1. **Scan QR Code**: Use the QR code from your invitation
2. **Verify Details**: Confirm your information
3. **Complete Check-In**: Badge is generated automatically

---

## Host Dashboard

### Accessing the Dashboard

1. Navigate to http://localhost:3000/host
2. Login with your credentials

### Current Visitors

View all visitors currently on-site:
- See visitor name, company, and check-in time
- Quick action: Check out visitor

### Pending Approvals

Review and manage visit requests:
- Approve or reject visits
- Add rejection reason
- Bulk approve multiple visits

### Visitor History

View your complete visitor history:
- Past visits with dates and purposes
- Visit statistics

---

## Admin Dashboard

### Accessing the Dashboard

1. Navigate to http://localhost:3000/dashboard
2. Login with admin credentials

### Dashboard Overview

- **Today's Visits**: Number of visitors today
- **Current Visitors**: People currently on-site
- **Pending Approvals**: Visits awaiting approval
- **Recent Activity**: Latest visitor activity

### Quick Actions

- **New Check-In**: Start a new visitor registration
- **View Visitors**: Access the visitor directory
- **Host View**: Switch to host perspective
- **Reports**: View analytics and reports

---

## Badge Management

### Digital Badges

Each visitor receives a digital badge with:
- QR code for scanning
- Visitor name and company
- Host name
- Expiration time
- Site location

### Badge Validity

- Badges expire after 8 hours (configurable)
- Extensions can be requested through the host
- Expired badges require re-check-in

### Returning Badges

When a visitor leaves:
1. Host or receptionist marks badge as returned
2. Badge status updates in the system
3. Overdue badges are flagged

---

## Safety & Security

### NDA Signing

For sensitive areas, visitors must sign an NDA:
1. NDA prompt appears during check-in
2. Visitor reads and signs digitally
3. Signature is recorded with timestamp

### Safety Briefings

Required for factory/production areas:
1. Safety checklist is presented
2. Visitor must complete all required items
3. Completion is recorded for the visit

### Area Access Control

Different areas have different access levels:
- **Public**: Open to all visitors
- **Restricted**: Requires host approval
- **Secure**: Requires NDA and safety briefing

---

## Emergency Procedures

### Emergency Contacts

In case of emergency, contact:
- **Security Control Room**: +8801712345682
- **Emergency Services**: 999
- **First Aid Station**: +8801712345683

### Evacuation Procedures

1. **Alert**: Emergency alarm sounds
2. **Evacuate**: Follow exit signs to nearest exit
3. **Assembly**: Gather at designated assembly point
4. **Headcount**: Wait for floor warden to count

### Emergency Information Page

Access emergency information at: http://localhost:3000/emergency

---

## Reports & Analytics

### Available Reports

- **Visitor Statistics**: Total visits, peak hours, visitor types
- **Site Comparison**: Compare activity across locations
- **Export Data**: Download CSV or HTML reports

### Accessing Reports

1. Navigate to http://localhost:3000/reports
2. Select date range and filters
3. View charts and tables
4. Export as needed

---

## FAQ

### Q: How do I extend a visitor's badge?

A: Hosts can extend badges through the host dashboard or by contacting reception.

### Q: What if I forget to check out?

A: The system will auto-checkout after 8 hours. Hosts can also manually check out visitors.

### Q: How do I become a host?

A: Contact your administrator to be added as an employee in the system.

### Q: Can I pre-register visitors?

A: Yes, hosts can pre-register visitors through the dashboard or API.

### Q: What happens if I'm on the watchlist?

A: You will be denied check-in and security will be notified.

### Q: How do I report a security incident?

A: Use the emergency page or contact security immediately.

---

## Support

For technical support or questions:
- **Email**: support@aptechgroup.com
- **Phone**: +8801712345682
- **Emergency**: +8801712345682

---

*Last updated: July 2026*
*Company: Aptech Group*
