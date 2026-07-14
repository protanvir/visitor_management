// Visitor types
export type VisitorType = "guest" | "contractor" | "vendor" | "delivery" | "interview";

// Visit status
export type VisitStatus = "pending" | "approved" | "checked_in" | "checked_out" | "cancelled";

// Notification types
export type NotificationType = "email" | "sms";

// Notification status
export type NotificationStatus = "pending" | "sent" | "failed";

// Employee roles
export type EmployeeRole = "admin" | "receptionist" | "security" | "employee";

// Base types with common fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Organization type
export interface Organization extends BaseEntity {
  name: string;
  settings?: Record<string, unknown>;
}

// Site type
export interface Site extends BaseEntity {
  organizationId: string;
  name: string;
  address?: string;
  timezone: string;
  settings?: Record<string, unknown>;
}

// Employee type
export interface Employee extends BaseEntity {
  organizationId: string;
  siteId?: string;
  email: string;
  name: string;
  department?: string;
  role: EmployeeRole;
  phone?: string;
}

// Visitor type
export interface Visitor extends BaseEntity {
  email?: string;
  name: string;
  phone?: string;
  company?: string;
  photoUrl?: string;
}

// Visit type
export interface Visit extends BaseEntity {
  visitorId: string;
  hostId: string;
  siteId: string;
  purpose?: string;
  visitorType: VisitorType;
  checkInTime?: Date;
  checkOutTime?: Date;
  expectedArrival?: Date;
  expectedDeparture?: Date;
  status: VisitStatus;
  ndaSigned: boolean;
  safetyBriefing: boolean;
}

// Badge type
export interface Badge extends BaseEntity {
  visitId: string;
  qrCode: string;
  expiresAt: Date;
}

// Notification type
export interface Notification extends BaseEntity {
  visitId: string;
  type: NotificationType;
  recipient: string;
  subject?: string;
  message: string;
  status: NotificationStatus;
  sentAt?: Date;
  error?: string;
}

// Watchlist type
export interface Watchlist extends BaseEntity {
  organizationId: string;
  email?: string;
  name?: string;
  phone?: string;
  reason: string;
  active: boolean;
}

// Safety checklist type
export interface SafetyChecklist extends BaseEntity {
  visitId: string;
  items: ChecklistItem[];
  completed: boolean;
}

// Checklist item type
export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Query parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Visit query parameters
export interface VisitQueryParams extends PaginationParams {
  status?: VisitStatus;
  visitorType?: VisitorType;
  siteId?: string;
  hostId?: string;
  startDate?: Date;
  endDate?: Date;
}
