import { prisma } from "../index";
import { sendEmail, emailTemplates } from "./email";
import { sendSms, smsTemplates, isValidBangladeshiPhone } from "./sms";

interface NotificationData {
  visitId: string;
  type: "email" | "sms";
  recipient: string;
  subject?: string;
  message: string;
}

// Create notification record
async function createNotification(data: NotificationData) {
  return prisma.notification.create({
    data: {
      visitId: data.visitId,
      type: data.type,
      recipient: data.recipient,
      subject: data.subject,
      message: data.message,
      status: "pending",
    },
  });
}

// Update notification status
async function updateNotificationStatus(
  id: string,
  status: "sent" | "failed",
  error?: string
) {
  return prisma.notification.update({
    where: { id },
    data: {
      status,
      sentAt: status === "sent" ? new Date() : undefined,
      error,
    },
  });
}

// Send notification
async function sendNotification(notification: NotificationData): Promise<boolean> {
  const record = await createNotification(notification);

  try {
    let success = false;

    if (notification.type === "email") {
      success = await sendEmail({
        to: notification.recipient,
        subject: notification.subject || "Aptech Group - VMS Notification",
        html: notification.message,
        text: notification.message.replace(/<[^>]*>/g, ""),
      });
    } else if (notification.type === "sms") {
      success = await sendSms({
        to: notification.recipient,
        message: notification.message,
      });
    }

    await updateNotificationStatus(record.id, success ? "sent" : "failed");
    return success;
  } catch (error) {
    await updateNotificationStatus(
      record.id,
      "failed",
      error instanceof Error ? error.message : "Unknown error"
    );
    return false;
  }
}

// Send both email and SMS
async function sendMultiChannelNotification(
  visitId: string,
  emailData?: { to: string; subject: string; html: string; text?: string },
  smsData?: { to: string; message: string }
): Promise<{ email: boolean; sms: boolean }> {
  const results = { email: false, sms: false };

  if (emailData) {
    results.email = await sendNotification({
      visitId,
      type: "email",
      recipient: emailData.to,
      subject: emailData.subject,
      message: emailData.html,
    });
  }

  if (smsData && isValidBangladeshiPhone(smsData.to)) {
    results.sms = await sendNotification({
      visitId,
      type: "sms",
      recipient: smsData.to,
      message: smsData.message,
    });
  }

  return results;
}

// Notification service
export const notificationService = {
  // Notify host about visitor arrival
  async notifyHostArrival(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
        host: true,
        site: true,
      },
    });

    if (!visit) return { email: false, sms: false };

    const emailTemplate = emailTemplates.visitorArrival(
      visit.visitor.name,
      visit.host.name,
      visit.purpose || undefined,
      visit.visitor.company || undefined,
      visit.id
    );

    const smsMessage = smsTemplates.visitorArrival(
      visit.visitor.name,
      visit.host.name,
      visit.visitor.company || undefined
    );

    return sendMultiChannelNotification(
      visitId,
      visit.host.email
        ? {
            to: visit.host.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
          }
        : undefined,
      visit.host.phone
        ? {
            to: visit.host.phone,
            message: smsMessage,
          }
        : undefined
    );
  },

  // Notify visitor about visit approval
  async notifyVisitApproval(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
        host: true,
        site: true,
      },
    });

    if (!visit || !visit.visitor.email) return { email: false, sms: false };

    const emailTemplate = emailTemplates.visitApproved(
      visit.visitor.name,
      visit.site.name,
      visit.host.name,
      visit.expectedArrival
        ? new Date(visit.expectedArrival).toLocaleDateString()
        : new Date().toLocaleDateString(),
      visit.id
    );

    const smsMessage = smsTemplates.visitApproved(
      visit.site.name,
      visit.host.name,
      visit.expectedArrival
        ? new Date(visit.expectedArrival).toLocaleDateString()
        : new Date().toLocaleDateString()
    );

    return sendMultiChannelNotification(
      visitId,
      {
        to: visit.visitor.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      },
      visit.visitor.phone
        ? {
            to: visit.visitor.phone,
            message: smsMessage,
          }
        : undefined
    );
  },

  // Notify visitor about visit rejection
  async notifyVisitRejection(visitId: string, reason?: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
      },
    });

    if (!visit || !visit.visitor.email) return { email: false, sms: false };

    const emailTemplate = emailTemplates.visitRejected(visit.visitor.name, reason);
    const smsMessage = smsTemplates.visitRejected(reason);

    return sendMultiChannelNotification(
      visitId,
      {
        to: visit.visitor.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      },
      visit.visitor.phone
        ? {
            to: visit.visitor.phone,
            message: smsMessage,
          }
        : undefined
    );
  },

  // Send check-out reminder
  async sendCheckOutReminder(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
        host: true,
      },
    });

    if (!visit || !visit.host.email) return { email: false, sms: false };

    const duration = visit.checkInTime
      ? Math.floor((Date.now() - visit.checkInTime.getTime()) / 60000)
      : 0;
    const durationFormatted = `${Math.floor(duration / 60)}h ${duration % 60}m`;

    const emailTemplate = emailTemplates.checkOutReminder(
      visit.visitor.name,
      visit.host.name,
      visit.checkInTime?.toLocaleString() || "",
      durationFormatted
    );

    const smsMessage = smsTemplates.checkOutReminder(
      visit.visitor.name,
      durationFormatted
    );

    return sendMultiChannelNotification(
      visitId,
      {
        to: visit.host.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      },
      visit.host.phone
        ? {
            to: visit.host.phone,
            message: smsMessage,
          }
        : undefined
    );
  },

  // Send check-in confirmation to visitor
  async sendCheckInConfirmation(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
        site: true,
        badge: true,
      },
    });

    if (!visit || !visit.visitor.email) return { email: false, sms: false };

    const expiryTime = visit.badge
      ? new Date(visit.badge.expiresAt).toLocaleTimeString()
      : "N/A";

    const smsMessage = smsTemplates.checkInConfirmation(
      visit.visitor.name,
      visit.site.name,
      expiryTime
    );

    return sendMultiChannelNotification(
      visitId,
      undefined, // No email template for check-in confirmation
      visit.visitor.phone
        ? {
            to: visit.visitor.phone,
            message: smsMessage,
          }
        : undefined
    );
  },

  // Send check-out confirmation to visitor
  async sendCheckOutConfirmation(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
      },
    });

    if (!visit || !visit.visitor.email) return { email: false, sms: false };

    const duration = visit.checkInTime && visit.checkOutTime
      ? Math.floor((visit.checkOutTime.getTime() - visit.checkInTime.getTime()) / 60000)
      : 0;
    const durationFormatted = `${Math.floor(duration / 60)}h ${duration % 60}m`;

    const smsMessage = smsTemplates.checkOutConfirmation(
      visit.visitor.name,
      durationFormatted
    );

    return sendMultiChannelNotification(
      visitId,
      undefined,
      visit.visitor.phone
        ? {
            to: visit.visitor.phone,
            message: smsMessage,
          }
        : undefined
    );
  },

  // Send NDA signing request
  async sendNdaRequest(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
        host: true,
        site: true,
      },
    });

    if (!visit || !visit.visitor.email) return { email: false, sms: false };

    const emailTemplate = emailTemplates.ndaSigningRequest(
      visit.visitor.name,
      visit.host.name,
      visit.site.name,
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/nda/${visitId}`
    );

    const smsMessage = smsTemplates.ndaReminder(visit.site.name);

    return sendMultiChannelNotification(
      visitId,
      {
        to: visit.visitor.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      },
      visit.visitor.phone
        ? {
            to: visit.visitor.phone,
            message: smsMessage,
          }
        : undefined
    );
  },

  // Send safety briefing notification
  async sendSafetyBriefingNotification(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
        site: true,
      },
    });

    if (!visit || !visit.visitor.email) return { email: false, sms: false };

    const emailTemplate = emailTemplates.safetyBriefingRequired(
      visit.visitor.name,
      visit.site.name,
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/safety/${visitId}`
    );

    const smsMessage = smsTemplates.safetyBriefingReminder(visit.site.name);

    return sendMultiChannelNotification(
      visitId,
      {
        to: visit.visitor.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      },
      visit.visitor.phone
        ? {
            to: visit.visitor.phone,
            message: smsMessage,
          }
        : undefined
    );
  },

  // Send emergency alert
  async sendEmergencyAlert(
    siteId: string,
    alertType: string,
    message: string,
    instructions: string
  ) {
    // Get all checked-in visitors for the site
    const visits = await prisma.visit.findMany({
      where: {
        siteId,
        status: "checked_in",
      },
      include: {
        visitor: true,
        host: true,
      },
    });

    const emailTemplate = emailTemplates.emergencyAlert(alertType, message, instructions);
    const smsMessage = smsTemplates.emergencyAlert(alertType, instructions);

    // Send to all visitors
    const results = [];
    for (const visit of visits) {
      const result = await sendMultiChannelNotification(
        visit.id,
        visit.visitor.email
          ? {
              to: visit.visitor.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
              text: emailTemplate.text,
            }
          : undefined,
        visit.visitor.phone
          ? {
              to: visit.visitor.phone,
              message: smsMessage,
            }
          : undefined
      );
      results.push(result);
    }

    return results;
  },

  // Send evacuation notice
  async sendEvacuationNotice(siteId: string, siteName: string) {
    const visits = await prisma.visit.findMany({
      where: {
        siteId,
        status: "checked_in",
      },
      include: {
        visitor: true,
      },
    });

    const smsMessage = smsTemplates.evacuationNotice(siteName);

    const results = [];
    for (const visit of visits) {
      if (visit.visitor.phone) {
        const result = await sendNotification({
          visitId: visit.id,
          type: "sms",
          recipient: visit.visitor.phone,
          message: smsMessage,
        });
        results.push(result);
      }
    }

    return results;
  },

  // Send daily summary to host
  async sendDailySummary(hostId: string) {
    const host = await prisma.employee.findUnique({
      where: { id: hostId },
    });

    if (!host) return { email: false, sms: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visits = await prisma.visit.findMany({
      where: {
        hostId,
        createdAt: { gte: today },
      },
      include: {
        visitor: true,
      },
    });

    const currentVisitors = visits.filter((v) => v.status === "checked_in");
    const visitorList = visits.slice(0, 10).map((v) => ({
      name: v.visitor.name,
      checkInTime: v.checkInTime?.toLocaleTimeString() || "N/A",
    }));

    const emailTemplate = emailTemplates.dailySummary(
      host.name,
      visits.length,
      currentVisitors.length,
      visitorList
    );

    const smsMessage = smsTemplates.dailySummary(
      visits.length,
      currentVisitors.length
    );

    return sendMultiChannelNotification(
      "daily-summary", // Special ID for daily summaries
      host.email
        ? {
            to: host.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
          }
        : undefined,
      host.phone
        ? {
            to: host.phone,
            message: smsMessage,
          }
        : undefined
    );
  },

  // Get notifications for a visit
  async getVisitNotifications(visitId: string) {
    return prisma.notification.findMany({
      where: { visitId },
      orderBy: { createdAt: "desc" },
    });
  },

  // Resend notification
  async resendNotification(notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) return false;

    return sendNotification({
      visitId: notification.visitId,
      type: notification.type as "email" | "sms",
      recipient: notification.recipient,
      subject: notification.subject || undefined,
      message: notification.message,
    });
  },

  // Get notification statistics
  async getNotificationStats(siteId?: string) {
    const where: any = {};
    if (siteId) {
      where.visit = { siteId };
    }

    const [total, sent, failed, pending] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, status: "sent" } }),
      prisma.notification.count({ where: { ...where, status: "failed" } }),
      prisma.notification.count({ where: { ...where, status: "pending" } }),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
    };
  },
};
