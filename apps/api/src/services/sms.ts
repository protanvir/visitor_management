interface SmsOptions {
  to: string;
  message: string;
}

interface AdnsmsConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
}

interface AdnsmsResponse {
  request_type?: string;
  campaign_uid?: string;
  sms_uid?: string;
  invalid_numbers?: string[];
  api_response_code: number;
  api_response_message: string;
  error?: {
    error_code: number;
    error_message: string;
  };
}

// ADNSMS configuration
const adnsmsConfig: AdnsmsConfig = {
  apiKey: process.env.ADNSMS_API_KEY || "",
  apiSecret: process.env.ADNSMS_API_SECRET || "",
  baseUrl: process.env.ADNSMS_BASE_URL || "https://api.adnsms.com",
};

// Format Bangladesh phone number
export function formatBangladeshiPhone(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle different formats
  if (cleaned.startsWith("880")) {
    // Already has country code
    return cleaned;
  } else if (cleaned.startsWith("0")) {
    // Local format with leading zero
    return "880" + cleaned.substring(1);
  } else if (cleaned.length === 10) {
    // Without leading zero
    return "880" + cleaned;
  }

  return cleaned;
}

// Validate Bangladesh phone number
export function isValidBangladeshiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // Bangladesh numbers: 8801XXXXXXXXX (13 digits with country code)
  // or 01XXXXXXXXX (11 digits without country code)
  if (cleaned.startsWith("880") && cleaned.length === 13) {
    return true;
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return true;
  }
  return false;
}

// Send single SMS via ADNSMS
export async function sendSms(options: SmsOptions): Promise<boolean> {
  try {
    // If no ADNSMS configured, log to console (development mode)
    if (!adnsmsConfig.apiKey || !adnsmsConfig.apiSecret) {
      console.log("[SMS Service] Development mode - logging SMS:");
      console.log(`  To: ${options.to}`);
      console.log(`  Message: ${options.message}`);
      return true;
    }

    // Format phone number
    const mobile = formatBangladeshiPhone(options.to);

    // Validate phone number
    if (!isValidBangladeshiPhone(mobile)) {
      console.error("[SMS Service] Invalid phone number:", options.to);
      return false;
    }

    // Prepare request body as JSON (per ADNsms API docs)
    const requestBody = {
      api_key: adnsmsConfig.apiKey,
      api_secret: adnsmsConfig.apiSecret,
      request_type: "SINGLE_SMS",
      message_type: "TEXT",
      mobile: mobile,
      message_body: options.message,
    };

    // Send request to ADNSMS with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${adnsmsConfig.baseUrl}/api/v1/secure/send-sms`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result: AdnsmsResponse = await response.json();

    if (result.api_response_code === 200 && result.api_response_message === "SUCCESS") {
      console.log(`[SMS Service] SMS sent to ${mobile} | UID: ${result.sms_uid}`);
      return true;
    } else {
      console.error("[SMS Service] Failed to send SMS:", result);
      return false;
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[SMS Service] SMS request timed out");
    } else {
      console.error("[SMS Service] Error sending SMS:", error.message || error);
    }
    return false;
  }
}

// Send bulk SMS via ADNSMS
export async function sendBulkSms(
  recipients: string[],
  message: string,
  campaignTitle: string = "Aptech Group VMS"
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  try {
    if (!adnsmsConfig.apiKey || !adnsmsConfig.apiSecret) {
      console.log("[SMS Service] Development mode - logging bulk SMS:");
      console.log(`  Recipients: ${recipients.join(", ")}`);
      console.log(`  Message: ${message}`);
      return { success: true, sentCount: recipients.length, failedCount: 0 };
    }

    // Format all phone numbers
    const formattedNumbers = recipients
      .filter((phone) => isValidBangladeshiPhone(phone))
      .map((phone) => formatBangladeshiPhone(phone));

    if (formattedNumbers.length === 0) {
      console.error("[SMS Service] No valid phone numbers provided");
      return { success: false, sentCount: 0, failedCount: recipients.length };
    }

    // Prepare request body as JSON (per ADNsms API docs)
    const requestBody = {
      api_key: adnsmsConfig.apiKey,
      api_secret: adnsmsConfig.apiSecret,
      request_type: "GENERAL_CAMPAIGN",
      message_type: "TEXT",
      mobile: formattedNumbers.join(","),
      message_body: message,
      isPromotional: 0,
      campaign_title: campaignTitle,
    };

    // Send request to ADNSMS with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${adnsmsConfig.baseUrl}/api/v1/secure/send-sms`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result: AdnsmsResponse = await response.json();

    if (result.api_response_code === 200 && result.api_response_message === "SUCCESS") {
      const invalidCount = result.invalid_numbers?.length || 0;
      const sentCount = formattedNumbers.length - invalidCount;
      console.log(`[SMS Service] Bulk SMS sent | Campaign: ${result.campaign_uid} | Sent: ${sentCount}`);
      return { success: true, sentCount, failedCount: invalidCount };
    } else {
      console.error("[SMS Service] Failed to send bulk SMS:", result);
      return { success: false, sentCount: 0, failedCount: recipients.length };
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[SMS Service] Bulk SMS request timed out");
    } else {
      console.error("[SMS Service] Error sending bulk SMS:", error.message || error);
    }
    return { success: false, sentCount: 0, failedCount: recipients.length };
  }
}

// Check ADNSMS balance
export async function checkBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
  try {
    if (!adnsmsConfig.apiKey || !adnsmsConfig.apiSecret) {
      return { success: false, error: "ADNSMS not configured" };
    }

    const requestBody = {
      api_key: adnsmsConfig.apiKey,
      api_secret: adnsmsConfig.apiSecret,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${adnsmsConfig.baseUrl}/api/v1/secure/check-balance`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();

    if (result.api_response_code === 200) {
      return { success: true, balance: result.balance?.sms || 0 };
    } else {
      return { success: false, error: result.error?.error_message || "Unknown error" };
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[SMS Service] Balance check timed out");
      return { success: false, error: "Request timed out" };
    }
    console.error("[SMS Service] Error checking balance:", error.message || error);
    return { success: false, error: "Failed to check balance" };
  }
}

// Check SMS status
export async function checkSmsStatus(smsUid: string): Promise<{ success: boolean; status?: string; error?: string }> {
  try {
    if (!adnsmsConfig.apiKey || !adnsmsConfig.apiSecret) {
      return { success: false, error: "ADNSMS not configured" };
    }

    const requestBody = {
      api_key: adnsmsConfig.apiKey,
      api_secret: adnsmsConfig.apiSecret,
      sms_uid: smsUid,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${adnsmsConfig.baseUrl}/api/v1/secure/sms-status`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();

    if (result.api_response_code === 200) {
      return { success: true, status: result.sms?.sms_status };
    } else {
      return { success: false, error: result.error?.error_message || "Record not found" };
    }
  } catch (error) {
    console.error("[SMS Service] Error checking status:", error);
    return { success: false, error: "Failed to check status" };
  }
}

// SMS templates for Aptech Group VMS
export const smsTemplates = {
  // Visitor arrival alert to host
  visitorArrival: (visitorName: string, hostName: string, company?: string) =>
    `APTECH GROUP: ${visitorName}${company ? ` from ${company}` : ""} has arrived to see you. Please meet them at reception. - Aptech VMS`,

  // Visit approved notification to visitor
  visitApproved: (siteName: string, hostName: string, visitDate: string) =>
    `APTECH GROUP: Your visit to ${siteName} on ${visitDate} with ${hostName} has been approved. Please check in at reception. - Aptech VMS`,

  // Visit rejected notification to visitor
  visitRejected: (reason?: string) =>
    `APTECH GROUP: Your visit request could not be approved${reason ? `. Reason: ${reason}` : ""}. Please contact your host for details. - Aptech VMS`,

  // Check-out reminder to host
  checkOutReminder: (visitorName: string, duration: string) =>
    `APTECH GROUP REMINDER: ${visitorName} has been on-site for ${duration}. Please ensure they check out before leaving. - Aptech VMS`,

  // Check-in confirmation to visitor
  checkInConfirmation: (visitorName: string, siteName: string, expiryTime: string) =>
    `APTECH GROUP: Welcome ${visitorName}! You are checked in at ${siteName}. Your badge expires at ${expiryTime}. - Aptech VMS`,

  // Check-out confirmation to visitor
  checkOutConfirmation: (visitorName: string, duration: string) =>
    `APTECH GROUP: Thank you for visiting! You checked out after ${duration}. Have a great day! - Aptech VMS`,

  // NDA reminder to visitor
  ndaReminder: (siteName: string) =>
    `APTECH GROUP: Please sign your NDA before visiting ${siteName}. You won't be able to check in without it. - Aptech VMS`,

  // Safety briefing reminder
  safetyBriefingReminder: (siteName: string) =>
    `APTECH GROUP: Complete your safety briefing before visiting ${siteName}. Required for factory access. - Aptech VMS`,

  // Emergency alert
  emergencyAlert: (alertType: string, instructions: string) =>
    `APTECH GROUP EMERGENCY: ${alertType}. ${instructions}. Follow staff instructions immediately.`,

  // Evacuation notice
  evacuationNotice: (siteName: string) =>
    `APTECH GROUP EVACUATION: Please evacuate ${siteName} immediately. Proceed to the nearest exit and gather at the assembly point.`,

  // Badge expiring soon
  badgeExpiringSoon: (minutesRemaining: number) =>
    `APTECH GROUP: Your visitor badge expires in ${minutesRemaining} minutes. Please check out or extend your visit at reception. - Aptech VMS`,

  // Daily summary
  dailySummary: (totalVisits: number, currentVisitors: number) =>
    `APTECH GROUP DAILY SUMMARY: ${totalVisits} visits today, ${currentVisitors} currently on-site. - Aptech VMS`,
};
