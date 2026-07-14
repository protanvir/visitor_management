// Redis caching service for Aptech Group VMS
// This provides a caching layer to improve performance

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 300; // 5 minutes
  private prefix: string = "vms";

  constructor(options?: CacheOptions) {
    if (options?.ttl) this.defaultTTL = options.ttl;
    if (options?.prefix) this.prefix = options.prefix;

    // Clean expired entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  // Generate cache key
  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  // Get item from cache
  get<T>(key: string): T | null {
    const fullKey = this.getKey(key);
    const entry = this.cache.get(fullKey);

    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(fullKey);
      return null;
    }

    return entry.data as T;
  }

  // Set item in cache
  set<T>(key: string, data: T, ttl?: number): void {
    const fullKey = this.getKey(key);
    const expiry = Date.now() + (ttl || this.defaultTTL) * 1000;

    this.cache.set(fullKey, { data, expiry });
  }

  // Delete item from cache
  delete(key: string): boolean {
    const fullKey = this.getKey(key);
    return this.cache.delete(fullKey);
  }

  // Delete all keys matching a pattern
  deletePattern(pattern: string): number {
    const regex = new RegExp(`^${this.prefix}:${pattern.replace(/\*/g, ".*")}$`);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    let totalEntries = this.cache.size;
    let expiredEntries = 0;
    let validEntries = 0;

    for (const entry of this.cache.values()) {
      if (Date.now() > entry.expiry) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries,
      validEntries,
      expiredEntries,
      memoryUsage: process.memoryUsage().heapUsed,
    };
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get or set (cache-aside pattern)
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }
}

// Singleton cache instance
export const cache = new CacheService({
  ttl: 300, // 5 minutes default
  prefix: "vms",
});

// Cache keys factory
export const CacheKeys = {
  // Visitors
  visitor: (id: string) => `visitor:${id}`,
  visitors: (page: number, search?: string) => `visitors:${page}:${search || "all"}`,
  
  // Visits
  visit: (id: string) => `visit:${id}`,
  activeVisits: (siteId?: string) => `active-visits:${siteId || "all"}`,
  evacuationList: (siteId?: string) => `evacuation:${siteId || "all"}`,
  
  // Employees
  employee: (id: string) => `employee:${id}`,
  employees: (page: number, search?: string) => `employees:${page}:${search || "all"}`,
  hostAvailability: (id: string, date: string) => `host-availability:${id}:${date}`,
  
  // Sites
  site: (id: string) => `site:${id}`,
  sites: () => "sites:all",
  
  // Reports
  dashboard: () => "dashboard:main",
  statistics: (siteId?: string) => `statistics:${siteId || "all"}`,
  
  // Areas
  areas: () => "areas:all",
  area: (id: string) => `area:${id}`,
  
  // Badges
  badge: (visitId: string) => `badge:${visitId}`,
  overdueBadges: () => "badges:overdue",
};

// Cache middleware for Express
export function cacheMiddleware(ttl: number = 300) {
  return (req: any, res: any, next: any) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached) {
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode === 200) {
        cache.set(key, body, ttl);
      }
      return originalJson(body);
    };

    next();
  };
}

export default cache;
