import { Router, Request, Response } from "express";
import { sendSms, sendBulkSms, checkBalance, checkSmsStatus, smsTemplates, formatBangladeshiPhone, isValidBangladeshiPhone } from "../services/sms";

const router = Router();

// Send single SMS
router.post("/send", async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: "Recipient (to) and message are required",
      });
    }

    const success = await sendSms({ to, message });

    if (success) {
      res.json({ success: true, message: "SMS sent successfully" });
    } else {
      res.status(500).json({ success: false, error: "Failed to send SMS" });
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ success: false, error: "Failed to send SMS" });
  }
});

// Send bulk SMS
router.post("/send-bulk", async (req: Request, res: Response) => {
  try {
    const { recipients, message, campaignTitle } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Recipients array is required",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const result = await sendBulkSms(recipients, message, campaignTitle);

    res.json({
      success: result.success,
      data: {
        sentCount: result.sentCount,
        failedCount: result.failedCount,
      },
      message: `Bulk SMS: ${result.sentCount} sent, ${result.failedCount} failed`,
    });
  } catch (error) {
    console.error("Error sending bulk SMS:", error);
    res.status(500).json({ success: false, error: "Failed to send bulk SMS" });
  }
});

// Check ADNSMS balance
router.get("/balance", async (req: Request, res: Response) => {
  try {
    const result = await checkBalance();

    if (result.success) {
      res.json({
        success: true,
        data: {
          balance: result.balance,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || "Failed to check balance",
      });
    }
  } catch (error) {
    console.error("Error checking balance:", error);
    res.status(500).json({ success: false, error: "Failed to check balance" });
  }
});

// Check SMS status
router.get("/status/:smsUid", async (req: Request, res: Response) => {
  try {
    const { smsUid } = req.params;
    const result = await checkSmsStatus(smsUid);

    if (result.success) {
      res.json({
        success: true,
        data: {
          smsUid,
          status: result.status,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error || "SMS not found",
      });
    }
  } catch (error) {
    console.error("Error checking SMS status:", error);
    res.status(500).json({ success: false, error: "Failed to check SMS status" });
  }
});

// Validate phone number
router.post("/validate-phone", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    const isValid = isValidBangladeshiPhone(phone);
    const formatted = isValid ? formatBangladeshiPhone(phone) : null;

    res.json({
      success: true,
      data: {
        phone,
        isValid,
        formatted,
      },
    });
  } catch (error) {
    console.error("Error validating phone:", error);
    res.status(500).json({ success: false, error: "Failed to validate phone" });
  }
});

// Get SMS templates
router.get("/templates", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        templates: {
          visitorArrival: "APTECH GROUP: {visitorName} has arrived to see you. Please meet them at reception.",
          visitApproved: "APTECH GROUP: Your visit to {siteName} has been approved. Please check in at reception.",
          visitRejected: "APTECH GROUP: Your visit request could not be approved. Please contact your host.",
          checkOutReminder: "APTECH GROUP REMINDER: {visitorName} has been on-site for {duration}.",
          checkInConfirmation: "APTECH GROUP: Welcome {visitorName}! You are checked in at {siteName}.",
          emergencyAlert: "APTECH GROUP EMERGENCY: {alertType}. {instructions}.",
          evacuationNotice: "APTECH GROUP EVACUATION: Please evacuate {siteName} immediately.",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ success: false, error: "Failed to fetch templates" });
  }
});

// Send test SMS (for development)
router.post("/test", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required for test SMS",
      });
    }

    const testMessage = "APTECH GROUP: This is a test message from your Visitor Management System. If you received this, SMS is configured correctly.";
    
    const success = await sendSms({ to: phone, message: testMessage });

    res.json({
      success,
      message: success ? "Test SMS sent successfully" : "Failed to send test SMS",
    });
  } catch (error) {
    console.error("Error sending test SMS:", error);
    res.status(500).json({ success: false, error: "Failed to send test SMS" });
  }
});

export default router;
