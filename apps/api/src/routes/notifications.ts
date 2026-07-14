import { Router, Request, Response } from "express";
import { notificationService } from "../services/notification";

const router = Router();

// Get notifications for a visit
router.get("/visit/:visitId", async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;

    const notifications = await notificationService.getVisitNotifications(visitId);

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, error: "Failed to fetch notifications" });
  }
});

// Resend notification
router.post("/:id/resend", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await notificationService.resendNotification(id);

    if (success) {
      res.json({ success: true, message: "Notification resent successfully" });
    } else {
      res.status(500).json({ success: false, error: "Failed to resend notification" });
    }
  } catch (error) {
    console.error("Error resending notification:", error);
    res.status(500).json({ success: false, error: "Failed to resend notification" });
  }
});

// Send check-out reminder
router.post("/reminder/:visitId", async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;

    const success = await notificationService.sendCheckOutReminder(visitId);

    if (success) {
      res.json({ success: true, message: "Reminder sent successfully" });
    } else {
      res.status(500).json({ success: false, error: "Failed to send reminder" });
    }
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ success: false, error: "Failed to send reminder" });
  }
});

export default router;
