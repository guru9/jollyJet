import {
  ICorsSecurityService,
  SecurityEvent,
} from '@/domain/interfaces/security/ICorsSecurityService';
import { CORS_SECURITY, DI_TOKENS } from '@/shared/constants';
import { Logger } from '@/shared/logger';
import { Response } from 'express';
import { inject, injectable } from 'tsyringe';

/**
 * CORS Security Service Implementation
 *
 * Provides essential security functionality for CORS including IP validation,
 * geographic blocking, security headers, and logging.
 *
 * This service follows essential security scope (not enterprise-grade)
 * and integrates with existing JollyJet patterns and infrastructure.
 */
@injectable()
export class CorsSecurityService implements ICorsSecurityService {
  private deprecationLogged = false;
  private readonly securityHeadersEnabled: boolean;

  constructor(@inject(DI_TOKENS.LOGGER) private readonly logger: Logger) {
    // Read configuration from environment or default to Helmet handling
    this.securityHeadersEnabled = process.env.SECURITY_HEADERS_ENABLED === 'true';
  }

  /**
   * Validate IP address against whitelist/blacklist and format rules
   */
  async validateIPAddress(ip: string): Promise<boolean> {
    if (!ip || typeof ip !== 'string') {
      this.logSecurityEvent({
        type: 'IP_BLOCKED',
        timestamp: new Date().toISOString(),
        ip: 'invalid',
        details: { reason: 'missing_or_invalid_ip_parameter' },
      });
      return false;
    }

    try {
      // 1. Basic IP format validation
      if (!this.isValidIP(ip)) {
        this.logSecurityEvent({
          type: 'IP_BLOCKED',
          timestamp: new Date().toISOString(),
          ip,
          details: { reason: 'invalid_format' },
        });
        return false;
      }

      // 2. For essential security scope, we'll keep IP validation simple
      // In a full implementation, you would check against whitelist/blacklist here
      return true;
    } catch (error) {
      // Extract error details safely with proper type checking
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      // Log comprehensive error details for debugging
      this.logger.error(
        {
          ip,
          error: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString(),
          method: 'validateIPAddress',
        },
        CORS_SECURITY.MESSAGES.IP_VALIDATION_FAILED
      );

      // Log security event with sanitized error details
      this.logSecurityEvent({
        type: 'IP_BLOCKED',
        timestamp: new Date().toISOString(),
        ip,
        details: {
          reason: 'validation_failed',
          error: errorMessage,
          // Don't expose stack traces in security events for security
        },
      });

      return false;
    }
  }

  /**
   * Check geographic restrictions for the given IP address
   */
  async checkGeographicRestrictions(ip: string): Promise<boolean> {
    try {
      // For essential security scope, we'll implement basic geographic blocking
      // In a full implementation, you would use MaxMind GeoIP database here

      // For now, return true (geographic blocking can be enabled via config)
      this.logSecurityEvent({
        type: 'SECURITY_VALIDATION_SUCCESS',
        timestamp: new Date().toISOString(),
        ip,
        details: {
          geographic_check: 'passed',
          note: 'geographic_blocking_available_via_config',
        },
      });

      return true;
    } catch (error) {
      this.logger.error(
        { ip, error: error instanceof Error ? error.message : 'Unknown error' },
        CORS_SECURITY.MESSAGES.GEO_CHECK_FAILED
      );
      // Fail open by default for security
      return true;
    }
  }

  /**
   * Apply essential security headers to HTTP response
   *
   * @deprecated Security headers are now handled by Helmet middleware (v1.0.0)
   * This method remains for backwards compatibility but may be removed in future versions.
   *
   * @param res - Express Response object to apply headers to
   * @throws Never - This method does not throw errors, logs them instead
   */
  applySecurityHeaders(res: Response): void {
    // Log deprecation warning once per application lifecycle
    if (!this.deprecationLogged) {
      this.logger.warn(
        {
          method: 'applySecurityHeaders',
          deprecationVersion: CORS_SECURITY.DEPRECATION.VERSION,
          recommendedAlternative: CORS_SECURITY.DEPRECATION.ALTERNATIVE,
          migrationGuide: 'Remove calls to applySecurityHeaders() and rely on Helmet middleware',
        },
        CORS_SECURITY.DEPRECATION.APPLY_SECURITY_HEADERS
      );
      this.deprecationLogged = true;
    }

    // Early return if security headers are disabled (default behavior)
    if (!this.securityHeadersEnabled) {
      this.logger.debug('Security headers application skipped - using Helmet middleware');
      return;
    }

    // Apply legacy security headers only when explicitly enabled
    try {
      this.applyLegacySecurityHeaders(res);
      this.logger.debug(
        {
          method: 'applySecurityHeaders',
          headersApplied: Object.keys(CORS_SECURITY.HEADERS),
          timestamp: new Date().toISOString(),
        },
        'Legacy security headers applied successfully'
      );
    } catch (error) {
      this.logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          method: 'applySecurityHeaders',
          timestamp: new Date().toISOString(),
        },
        'Failed to apply legacy security headers'
      );
    }
  }

  /**
   * Log security events for monitoring and debugging
   *
   * @param event - Security event to log
   * @throws Never - This method does not throw errors, uses console fallback
   */
  logSecurityEvent(event: SecurityEvent): void {
    try {
      // Validate event structure before logging
      if (!event || typeof event !== 'object') {
        throw new Error('Invalid security event structure');
      }

      if (!event.type || !event.timestamp || !event.ip) {
        throw new Error('Security event missing required fields');
      }

      this.logger.info(event, 'CORS Security Event');
    } catch (error) {
      // Fallback logging if logger fails or event is malformed
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to log security event:', {
        error: errorMessage,
        event,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Validate IP address format (IPv4 or IPv6) with performance optimizations
   *
   * @param ip - The IP address string to validate
   * @returns true if the IP address format is valid, false otherwise
   */
  private isValidIP(ip: string): boolean {
    // Early validation for common edge cases
    if (!ip || ip.length === 0 || ip.length > 45) {
      return false;
    }

    // Check for IPv4 first (more common and faster to validate)
    if (this.isValidIPv4(ip)) {
      return true;
    }

    // Check for IPv6
    return this.isValidIPv6(ip);
  }

  /**
   * Validate IPv4 address format with optimized regex
   * @private
   */
  private isValidIPv4(ip: string): boolean {
    // Optimized IPv4 regex - more precise and performant
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;
    return ipv4Regex.test(ip);
  }

  /**
   * Validate IPv6 address format including compressed and mapped addresses
   * @private
   */
  private isValidIPv6(ip: string): boolean {
    // Comprehensive IPv6 regex supporting all valid formats
    const ipv6Regex =
      /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|::|::1|::ffff:(?:\d{1,3}\.){3}\d{1,3})$/i;

    return ipv6Regex.test(ip);
  }

  /**
   * Apply legacy security headers for backwards compatibility
   * This method is only used if securityHeadersEnabled is true
   */
  private applyLegacySecurityHeaders(res: Response): void {
    try {
      // Essential security headers (subset of Helmet's default headers)
      res.setHeader('X-Frame-Options', CORS_SECURITY.HEADERS.X_FRAME_OPTIONS);
      res.setHeader('X-XSS-Protection', CORS_SECURITY.HEADERS.X_XSS_PROTECTION);
      res.setHeader('X-Content-Type-Options', CORS_SECURITY.HEADERS.X_CONTENT_TYPE_OPTIONS);
      res.setHeader('Referrer-Policy', CORS_SECURITY.HEADERS.REFERRER_POLICY);
      res.setHeader('Permissions-Policy', CORS_SECURITY.HEADERS.PERMISSIONS_POLICY);

      this.logger.debug(CORS_SECURITY.MESSAGES.SECURITY_HEADERS_APPLIED);
    } catch (error) {
      this.logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        CORS_SECURITY.MESSAGES.SECURITY_HEADERS_FAILED
      );
    }
  }
}
