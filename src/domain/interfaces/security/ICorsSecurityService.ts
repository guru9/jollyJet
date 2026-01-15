import { Response } from 'express';

/**
 * Security event interface for CORS security logging
 */
export interface SecurityEvent {
  type: 'IP_BLOCKED' | 'GEO_BLOCKED' | 'SECURITY_VALIDATION_SUCCESS';
  timestamp: string;
  ip: string;
  country?: string;
  details?: Record<string, unknown>;
}

/**
 * Configuration interface for IP-based validation
 */
export interface IPValidationConfig {
  whitelist: string[];
  blacklist: string[];
  geographicBlocking: boolean;
}

/**
 * Configuration interface for geographic blocking
 */
export interface GeographicConfig {
  enabled: boolean;
  allowedCountries: string[];
  blockedCountries: string[];
  databasePath: string;
  defaultAction: 'allow' | 'block';
}

/**
 * CORS Security Service Interface
 *
 * Defines the contract for essential CORS security operations including
 * IP validation, geographic blocking, security headers, and logging.
 * This interface follows essential security scope (not enterprise-grade)
 * and integrates with existing JollyJet patterns and infrastructure.
 */
export interface ICorsSecurityService {
  /**
   * Validate IP address against whitelist/blacklist and format rules
   *
   * @param ip - Client IP address to validate
   * @returns Promise<boolean> - True if IP is allowed, false otherwise
   */
  validateIPAddress(ip: string): Promise<boolean>;

  /**
   * Check geographic restrictions for the given IP address
   *
   * @param ip - Client IP address to check geographically
   * @returns Promise<boolean> - True if IP is from allowed location, false otherwise
   */
  checkGeographicRestrictions(ip: string): Promise<boolean>;

  /**
   * Apply essential security headers to HTTP response
   *
   * @param res - Express response object to set headers on
   */
  applySecurityHeaders(res: Response): void;

  /**
   * Log security events for monitoring and debugging
   *
   * @param event - Security event details to log
   */
  logSecurityEvent(event: SecurityEvent): void;
}
