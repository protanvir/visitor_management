import { Request, Response, NextFunction } from "express";

// Content Security Policy configuration
export const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "blob:"],
    connectSrc: ["'self'", "http://localhost:3001"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
  },
};

// Generate CSP header string
export function generateCSPHeader(): string {
  const directives = Object.entries(cspConfig.directives)
    .map(([key, values]) => {
      const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${kebabKey} ${values.join(" ")}`;
    })
    .join("; ");
  return directives;
}

// CSP middleware
export function cspMiddleware(req: Request, res: Response, next: NextFunction) {
  const cspHeader = generateCSPHeader();
  res.setHeader("Content-Security-Policy", cspHeader);
  next();
}

// Security headers middleware
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  
  // Enable XSS protection in older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Permissions policy
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  
  next();
}

// Input sanitization utilities
export const InputSanitizer = {
  // Sanitize string input - remove potential XSS
  sanitizeString(input: string): string {
    if (typeof input !== "string") return input;
    
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },

  // Sanitize object recursively
  sanitizeObject(obj: any): any {
    if (typeof obj === "string") {
      return this.sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  },

  // Strip HTML tags
  stripHtml(input: string): string {
    if (typeof input !== "string") return input;
    return input.replace(/<[^>]*>/g, "");
  },

  // Sanitize email
  sanitizeEmail(email: string): string {
    if (typeof email !== "string") return email;
    return email.toLowerCase().trim();
  },

  // Sanitize phone number - keep only digits and + 
  sanitizePhone(phone: string): string {
    if (typeof phone !== "string") return phone;
    return phone.replace(/[^\d+]/g, "");
  },
};

// Input sanitization middleware
export function inputSanitizationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Sanitize request body
  if (req.body && typeof req.body === "object") {
    req.body = InputSanitizer.sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === "object") {
    const sanitizedQuery: any = {};
    for (const [key, value] of Object.entries(req.query)) {
      sanitizedQuery[key] = InputSanitizer.sanitizeObject(value);
    }
    req.query = sanitizedQuery;
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === "object") {
    const sanitizedParams: any = {};
    for (const [key, value] of Object.entries(req.params)) {
      sanitizedParams[key] = InputSanitizer.sanitizeObject(value);
    }
    req.params = sanitizedParams;
  }

  next();
}

// SQL injection prevention (additional layer beyond Prisma)
export function sqlInjectionPrevention(req: Request, res: Response, next: NextFunction) {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(CHAR\(|CONCAT\(|0x[0-9a-f]+)/i,
  ];

  const checkForSqlInjection = (value: any): boolean => {
    if (typeof value !== "string") return false;
    return sqlPatterns.some((pattern) => pattern.test(value));
  };

  // Check body
  if (req.body) {
    for (const value of Object.values(req.body)) {
      if (checkForSqlInjection(value)) {
        console.warn("[Security] Potential SQL injection attempt detected:", req.ip, req.path);
        return res.status(400).json({
          success: false,
          error: "Invalid input detected",
        });
      }
    }
  }

  // Check query
  if (req.query) {
    for (const value of Object.values(req.query)) {
      if (checkForSqlInjection(value)) {
        console.warn("[Security] Potential SQL injection attempt detected:", req.ip, req.path);
        return res.status(400).json({
          success: false,
          error: "Invalid input detected",
        });
      }
    }
  }

  next();
}

// Request logging middleware
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";
    
    console.log(`[${logLevel.toUpperCase()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  
  next();
}
