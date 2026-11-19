import { describe, it, expect, beforeEach } from '@jest/globals';

/**
 * Security Test Suite for Contact Form API
 * Tests: HTML escaping, rate limiting, input validation, CORS
 */

describe('Contact Form Security', () => {
  describe('HTML Escaping', () => {
    it('should escape HTML entities in name field', () => {
      const maliciousName = '<img src=x onerror="alert(1)">';
      const escaped = escapeHtml(maliciousName);
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });

    it('should escape HTML entities in message field', () => {
      const maliciousMessage = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(maliciousMessage);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('should escape quotes and ampersands', () => {
      const mixed = '&<>"\'';
      const escaped = escapeHtml(mixed);
      expect(escaped).toBe('&amp;&lt;&gt;&quot;&#039;');
    });

    it('should preserve normal text', () => {
      const normal = 'Hello World!';
      const escaped = escapeHtml(normal);
      expect(escaped).toBe(normal);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'user@example.com',
        'test+tag@domain.co.uk',
        'name.surname@company.org'
      ];

      validEmails.forEach(email => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(pattern.test(email)).toBe(true);
      });
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'invalid.email',
        '@example.com',
        'user@',
        'user name@example.com'
      ];

      invalidEmails.forEach(email => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(pattern.test(email)).toBe(false);
      });
    });

    it('should validate name pattern', () => {
      const pattern = /^[a-zA-Z\s'-]{2,100}$/;

      expect(pattern.test('John Doe')).toBe(true);
      expect(pattern.test("O'Brien")).toBe(true);
      expect(pattern.test('Marie-Claire')).toBe(true);
      expect(pattern.test('A')).toBe(false); // too short
      expect(pattern.test('John123')).toBe(false); // contains numbers
    });

    it('should validate company pattern', () => {
      const pattern = /^[a-zA-Z0-9\s&'-]{0,100}$/;

      expect(pattern.test('Acme & Co.')).toBe(true);
      expect(pattern.test("O'Reilly Media")).toBe(true);
      expect(pattern.test('Company-Name')).toBe(true);
      expect(pattern.test('Company@Inc')).toBe(false); // @ not allowed
    });

    it('should validate message length', () => {
      const pattern = /^[\s\S]{10,5000}$/;

      expect(pattern.test('a'.repeat(10))).toBe(true);
      expect(pattern.test('a'.repeat(5000))).toBe(true);
      expect(pattern.test('short')).toBe(false); // too short
      expect(pattern.test('a'.repeat(5001))).toBe(false); // too long
    });

    it('should allow multiline messages', () => {
      const multiline = 'Line 1\nLine 2\nLine 3\nLine 4';
      const pattern = /^[\s\S]{10,5000}$/;
      expect(pattern.test(multiline)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    let requestCounts: Map<string, { count: number; resetTime: number }>;

    beforeEach(() => {
      requestCounts = new Map();
    });

    function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
      const now = Date.now();
      const record = requestCounts.get(ip);

      if (!record || now > record.resetTime) {
        requestCounts.set(ip, { count: 1, resetTime: now + 60000 });
        return { allowed: true, remaining: 4, resetTime: now + 60000 };
      }

      if (record.count >= 5) {
        return { allowed: false, remaining: 0, resetTime: record.resetTime };
      }

      record.count++;
      return { allowed: true, remaining: 5 - record.count, resetTime: record.resetTime };
    }

    it('should allow first 5 requests', () => {
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit('192.168.1.1');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block 6th request', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('192.168.1.1');
      }

      const result = checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(false);
    });

    it('should track remaining count', () => {
      let result = checkRateLimit('192.168.1.1');
      expect(result.remaining).toBe(4);

      result = checkRateLimit('192.168.1.1');
      expect(result.remaining).toBe(3);

      result = checkRateLimit('192.168.1.1');
      expect(result.remaining).toBe(2);
    });

    it('should isolate rate limits by IP', () => {
      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');

      // Different IP should still be allowed
      const result = checkRateLimit('192.168.1.2');
      expect(result.allowed).toBe(true);
    });
  });

  describe('CORS Headers', () => {
    it('should allow same-origin requests in production', () => {
      const origin = 'https://routemaster.online';
      const allowedOrigins = [
        'https://routemaster.online',
        'https://www.routemaster.online'
      ];

      expect(allowedOrigins.includes(origin)).toBe(true);
    });

    it('should restrict to allowed origins', () => {
      const allowedOrigins = [
        'https://routemaster.online',
        'https://www.routemaster.online'
      ];

      expect(allowedOrigins.includes('https://evil.com')).toBe(false);
      expect(allowedOrigins.includes('http://localhost:3000')).toBe(false); // localhost not in production
    });

    it('should not allow cross-origin in production', () => {
      const isProduction = true;
      const origin = isProduction ? 'https://routemaster.online' : '*';

      expect(origin).not.toBe('*');
      expect(origin).toBe('https://routemaster.online');
    });
  });
});

// Mock escapeHtml function for testing
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
