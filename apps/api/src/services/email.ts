import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send email
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // If no SMTP configured, log to console (development mode)
    if (!process.env.SMTP_USER) {
      console.log("[Email Service] Development mode - logging email:");
      console.log(`  To: ${options.to}`);
      console.log(`  Subject: ${options.subject}`);
      console.log(`  Body preview: ${options.text || options.html.substring(0, 150)}...`);
      return true;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "Aptech Group VMS <noreply@aptechgroup.com>",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    });

    console.log(`[Email Service] Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send email:", error);
    return false;
  }
}

// Base email template wrapper
const baseTemplate = (content: string, previewText?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aptech Group - Visitor Management</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #102a43 0%, #334e68 100%); padding: 32px; text-align: center; }
    .logo { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #ffffff; border-radius: 8px; margin-bottom: 16px; }
    .logo-text { font-size: 24px; font-weight: bold; color: #102a43; }
    .header-title { color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; }
    .header-subtitle { color: #9fb3c8; font-size: 14px; margin: 8px 0 0 0; }
    .content { padding: 32px; }
    .content-title { color: #102a43; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; }
    .content-text { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; }
    .info-box { background-color: #f0f4f8; border-left: 4px solid #0967d2; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .info-label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { color: #102a43; font-size: 15px; font-weight: 500; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .btn { display: inline-block; background-color: #0967d2; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 16px 0; }
    .btn:hover { background-color: #0552b5; }
    .btn-success { background-color: #059669; }
    .btn-success:hover { background-color: #047857; }
    .btn-danger { background-color: #dc2626; }
    .btn-danger:hover { background-color: #b91c1c; }
    .divider { border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .footer { background-color: #102a43; padding: 24px 32px; text-align: center; }
    .footer-text { color: #9fb3c8; font-size: 13px; margin: 0; }
    .footer-link { color: #60a5fa; text-decoration: none; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-success { background-color: #d1fae5; color: #065f46; }
    .badge-warning { background-color: #fef3c7; color: #92400e; }
    .badge-danger { background-color: #fee2e2; color: #991b1b; }
    .badge-primary { background-color: #dbeafe; color: #1e40af; }
    .highlight { background-color: #fef3c7; padding: 12px 16px; border-radius: 8px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-text">A</span>
      </div>
      <h1 class="header-title">Aptech Group</h1>
      <p class="header-subtitle">Visitor Management System</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p class="footer-text">
        © ${new Date().getFullYear()} Aptech Group. All rights reserved.<br>
        <a href="#" class="footer-link">Privacy Policy</a> • <a href="#" class="footer-link">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// Email templates
export const emailTemplates = {
  // Visitor arrival notification to host
  visitorArrival: (
    visitorName: string,
    hostName: string,
    purpose?: string,
    company?: string,
    visitId?: string
  ) => ({
    subject: `Visitor Arrival: ${visitorName} is here to see you`,
    html: baseTemplate(`
      <h2 class="content-title">Hello ${hostName},</h2>
      <p class="content-text">
        A visitor has arrived at Aptech Group and is waiting to meet you.
      </p>
      
      <div class="info-box">
        <div class="info-grid">
          <div>
            <p class="info-label">Visitor Name</p>
            <p class="info-value">${visitorName}</p>
          </div>
          ${company ? `
          <div>
            <p class="info-label">Company</p>
            <p class="info-value">${company}</p>
          </div>
          ` : ""}
          <div>
            <p class="info-label">Purpose</p>
            <p class="info-value">${purpose || "Not specified"}</p>
          </div>
          <div>
            <p class="info-label">Arrival Time</p>
            <p class="info-value">${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <p class="content-text">
        Please proceed to the reception area to greet your visitor.
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/host" class="btn btn-success">
          View in Dashboard
        </a>
      </div>

      <div class="highlight">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>Note:</strong> If you are unavailable, please notify reception immediately.
        </p>
      </div>
    `),
    text: `Hello ${hostName},

A visitor has arrived at Aptech Group and is waiting to meet you.

Visitor: ${visitorName}
${company ? `Company: ${company}` : ""}
Purpose: ${purpose || "Not specified"}
Arrival Time: ${new Date().toLocaleString()}

Please proceed to the reception area to greet your visitor.

© ${new Date().getFullYear()} Aptech Group`,
  }),

  // Visit approved notification to visitor
  visitApproved: (
    visitorName: string,
    siteName: string,
    hostName: string,
    visitDate: string,
    visitId: string
  ) => ({
    subject: `Your Visit to Aptech Group Has Been Approved`,
    html: baseTemplate(`
      <h2 class="content-title">Visit Approved</h2>
      <p class="content-text">
        Dear ${visitorName},
      </p>
      <p class="content-text">
        Great news! Your visit request to <strong>Aptech Group</strong> has been approved.
        We look forward to welcoming you.
      </p>

      <div class="info-box">
        <div class="info-grid">
          <div>
            <p class="info-label">Location</p>
            <p class="info-value">${siteName}</p>
          </div>
          <div>
            <p class="info-label">Host</p>
            <p class="info-value">${hostName}</p>
          </div>
          <div>
            <p class="info-label">Visit Date</p>
            <p class="info-value">${visitDate}</p>
          </div>
          <div>
            <p class="info-label">Reference ID</p>
            <p class="info-value">${visitId.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <h3 style="color: #102a43; font-size: 16px; margin: 24px 0 12px 0;">Check-In Instructions</h3>
      <ol style="color: #475569; font-size: 15px; line-height: 1.8; padding-left: 20px;">
        <li>Arrive at the reception area</li>
        <li>Use the self-service kiosk or inform the receptionist</li>
        <li>Present a valid photo ID if requested</li>
        <li>Receive your visitor badge</li>
      </ol>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/kiosk" class="btn">
          Check In Online
        </a>
      </div>

      <div class="highlight">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>Important:</strong> Please bring a valid photo ID and arrive 5 minutes before your scheduled time.
        </p>
      </div>
    `),
    text: `Dear ${visitorName},

Your visit to Aptech Group has been approved!

Location: ${siteName}
Host: ${hostName}
Visit Date: ${visitDate}
Reference ID: ${visitId.slice(0, 8).toUpperCase()}

Check-In Instructions:
1. Arrive at the reception area
2. Use the self-service kiosk or inform the receptionist
3. Present a valid photo ID if requested
4. Receive your visitor badge

© ${new Date().getFullYear()} Aptech Group`,
  }),

  // Visit rejected notification to visitor
  visitRejected: (visitorName: string, reason?: string) => ({
    subject: `Update on Your Visit Request to Aptech Group`,
    html: baseTemplate(`
      <h2 class="content-title">Visit Request Update</h2>
      <p class="content-text">
        Dear ${visitorName},
      </p>
      <p class="content-text">
        Thank you for your interest in visiting Aptech Group. After careful review, 
        we regret to inform you that your visit request could not be approved at this time.
      </p>

      ${reason ? `
      <div class="info-box">
        <p class="info-label">Reason</p>
        <p class="info-value">${reason}</p>
      </div>
      ` : ""}

      <p class="content-text">
        If you believe this is an error or require further assistance, please contact 
        the person you were planning to visit directly.
      </p>

      <div class="divider"></div>

      <p class="content-text" style="font-size: 14px; color: #64748b;">
        We appreciate your understanding and hope to welcome you in the future.
      </p>
    `),
    text: `Dear ${visitorName},

Thank you for your interest in visiting Aptech Group. After careful review, we regret to inform you that your visit request could not be approved at this time.

${reason ? `Reason: ${reason}` : ""}

If you believe this is an error or require further assistance, please contact the person you were planning to visit directly.

© ${new Date().getFullYear()} Aptech Group`,
  }),

  // Check-out reminder to host
  checkOutReminder: (
    visitorName: string,
    hostName: string,
    checkInTime: string,
    duration: string
  ) => ({
    subject: `Reminder: ${visitorName} is Still Checked In`,
    html: baseTemplate(`
      <h2 class="content-title">Check-Out Reminder</h2>
      <p class="content-text">
        Hello ${hostName},
      </p>
      <p class="content-text">
        This is a friendly reminder that <strong>${visitorName}</strong> is still checked in 
        at Aptech Group.
      </p>

      <div class="info-box">
        <div class="info-grid">
          <div>
            <p class="info-label">Visitor</p>
            <p class="info-value">${visitorName}</p>
          </div>
          <div>
            <p class="info-label">Check-In Time</p>
            <p class="info-value">${checkInTime}</p>
          </div>
          <div>
            <p class="info-label">Duration</p>
            <p class="info-value">${duration}</p>
          </div>
        </div>
      </div>

      <p class="content-text">
        Please ensure your visitor checks out before leaving the premises. 
        If your visitor has already left, please inform reception.
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/host" class="btn">
          View Dashboard
        </a>
      </div>
    `),
    text: `Hello ${hostName},

This is a friendly reminder that ${visitorName} is still checked in at Aptech Group.

Visitor: ${visitorName}
Check-In Time: ${checkInTime}
Duration: ${duration}

Please ensure your visitor checks out before leaving the premises.

© ${new Date().getFullYear()} Aptech Group`,
  }),

  // NDA signing request
  ndaSigningRequest: (
    visitorName: string,
    hostName: string,
    siteName: string,
    ndaUrl: string
  ) => ({
    subject: `NDA Signing Required for Your Visit to Aptech Group`,
    html: baseTemplate(`
      <h2 class="content-title">NDA Signing Required</h2>
      <p class="content-text">
        Dear ${visitorName},
      </p>
      <p class="content-text">
        Before your visit to <strong>${siteName}</strong>, we require you to sign a 
        Non-Disclosure Agreement (NDA). This is a standard security measure to protect 
        confidential information.
      </p>

      <div class="info-box">
        <div class="info-grid">
          <div>
            <p class="info-label">Location</p>
            <p class="info-value">${siteName}</p>
          </div>
          <div>
            <p class="info-label">Host</p>
            <p class="info-value">${hostName}</p>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${ndaUrl}" class="btn btn-success">
          Sign NDA Now
        </a>
      </div>

      <div class="highlight">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>Note:</strong> Please complete this at least 24 hours before your visit. 
          You will not be able to check in without a signed NDA.
        </p>
      </div>
    `),
    text: `Dear ${visitorName},

Before your visit to ${siteName}, we require you to sign a Non-Disclosure Agreement (NDA).

Please sign the NDA at: ${ndaUrl}

This must be completed at least 24 hours before your visit.

© ${new Date().getFullYear()} Aptech Group`,
  }),

  // Safety briefing notification
  safetyBriefingRequired: (
    visitorName: string,
    siteName: string,
    briefingUrl: string
  ) => ({
    subject: `Safety Briefing Required for Factory Visit`,
    html: baseTemplate(`
      <h2 class="content-title">Safety Briefing Required</h2>
      <p class="content-text">
        Dear ${visitorName},
      </p>
      <p class="content-text">
        Your upcoming visit to <strong>${siteName}</strong> requires completion of a 
        mandatory safety briefing. This is required for all visitors entering the 
        factory/production area.
      </p>

      <div class="highlight">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>Important:</strong> The safety briefing takes approximately 10 minutes 
          and covers essential safety protocols for the factory floor.
        </p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${briefingUrl}" class="btn btn-success">
          Complete Safety Briefing
        </a>
      </div>

      <h3 style="color: #102a43; font-size: 16px; margin: 24px 0 12px 0;">What You'll Learn</h3>
      <ul style="color: #475569; font-size: 15px; line-height: 1.8; padding-left: 20px;">
        <li>Emergency exit locations</li>
        <li>Assembly points</li>
        <li>PPE requirements</li>
        <li>Restricted areas</li>
        <li>Reporting procedures</li>
      </ul>
    `),
    text: `Dear ${visitorName},

Your visit to ${siteName} requires completion of a mandatory safety briefing.

Please complete the briefing at: ${briefingUrl}

The briefing takes approximately 10 minutes and covers essential safety protocols.

© ${new Date().getFullYear()} Aptech Group`,
  }),

  // Emergency notification
  emergencyAlert: (
    alertType: string,
    message: string,
    instructions: string
  ) => ({
    subject: `URGENT: ${alertType} - Aptech Group`,
    html: baseTemplate(`
      <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
        <h2 style="color: #991b1b; margin: 0; font-size: 24px;">⚠️ EMERGENCY ALERT</h2>
        <p style="color: #991b1b; margin: 8px 0 0 0; font-size: 18px;">${alertType}</p>
      </div>

      <p class="content-text" style="font-size: 16px;">
        ${message}
      </p>

      <div class="info-box" style="border-left-color: #dc2626; background-color: #fef2f2;">
        <p class="info-label" style="color: #991b1b;">INSTRUCTIONS</p>
        <p class="info-value" style="color: #991b1b;">${instructions}</p>
      </div>

      <div class="highlight" style="background-color: #fee2e2;">
        <p style="margin: 0; font-size: 14px; color: #991b1b;">
          <strong>Act immediately. Your safety is our priority.</strong>
        </p>
      </div>
    `),
    text: `EMERGENCY ALERT: ${alertType}

${message}

INSTRUCTIONS: ${instructions}

Act immediately. Your safety is our priority.

© ${new Date().getFullYear()} Aptech Group`,
  }),

  // Daily summary to host
  dailySummary: (
    hostName: string,
    totalVisits: number,
    currentVisitors: number,
    visitorList: Array<{ name: string; checkInTime: string }>
  ) => ({
    subject: `Daily Visitor Summary - Aptech Group`,
    html: baseTemplate(`
      <h2 class="content-title">Daily Visitor Summary</h2>
      <p class="content-text">
        Hello ${hostName},
      </p>
      <p class="content-text">
        Here's your visitor summary for today at Aptech Group.
      </p>

      <div class="info-box">
        <div class="info-grid">
          <div>
            <p class="info-label">Total Visits Today</p>
            <p class="info-value">${totalVisits}</p>
          </div>
          <div>
            <p class="info-label">Currently On-Site</p>
            <p class="info-value">${currentVisitors}</p>
          </div>
        </div>
      </div>

      ${visitorList.length > 0 ? `
      <h3 style="color: #102a43; font-size: 16px; margin: 24px 0 12px 0;">Visitor Activity</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-transform: uppercase;">Visitor</th>
            <th style="text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-transform: uppercase;">Check-In</th>
          </tr>
        </thead>
        <tbody>
          ${visitorList
            .map(
              (v) => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${v.name}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${v.checkInTime}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      ` : ""}

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" class="btn">
          View Full Dashboard
        </a>
      </div>
    `),
    text: `Daily Visitor Summary

Hello ${hostName},

Here's your visitor summary for today at Aptech Group.

Total Visits Today: ${totalVisits}
Currently On-Site: ${currentVisitors}

${
  visitorList.length > 0
    ? `Visitor Activity:
${visitorList.map((v) => `- ${v.name} (Check-in: ${v.checkInTime})`).join("\n")}`
    : "No visitors today."
}

© ${new Date().getFullYear()} Aptech Group`,
  }),
};
