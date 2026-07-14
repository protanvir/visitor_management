// Structured logging service for Aptech Group VMS

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  data?: any;
  error?: string;
  stack?: string;
}

class Logger {
  private context: string;
  private minLevel: LogLevel;

  constructor(context: string = "app", minLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatEntry(entry: LogEntry): string {
    if (process.env.NODE_ENV === "production") {
      // JSON format for production
      return JSON.stringify(entry);
    }
    
    // Pretty format for development
    const colors = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m",  // Green
      warn: "\x1b[33m",  // Yellow
      error: "\x1b[31m", // Red
    };
    const reset = "\x1b[0m";
    
    return `${colors[entry.level as keyof typeof colors] || ""}[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.context}]${reset} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
    };

    if (data instanceof Error) {
      entry.error = data.message;
      entry.stack = data.stack;
    }

    const formatted = this.formatEntry(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: any) {
    this.log(LogLevel.ERROR, message, error);
  }

  // Create a child logger with a different context
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`, this.minLevel);
  }
}

// Create logger instances
export const logger = new Logger("vms");
export const authLogger = logger.child("auth");
export const visitLogger = logger.child("visit");
export const notificationLogger = logger.child("notification");
export const smsLogger = logger.child("sms");
export const securityLogger = logger.child("security");

// Request logging middleware
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Add request ID to headers
  res.setHeader("X-Request-ID", requestId);

  // Log request
  logger.info(`[${requestId}] ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Log response
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "warn" : "info";
    
    logger[level](`[${requestId}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}

export default logger;
