import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from './error-handling.service';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorMessage', () => {
    it('should return message from error object', () => {
      const error = new HttpErrorResponse({
        error: { message: 'Custom error message' },
        status: 400
      });
      expect(service.getErrorMessage(error)).toBe('Custom error message');
    });

    it('should join array of messages', () => {
      const error = new HttpErrorResponse({
        error: { message: ['Error 1', 'Error 2'] },
        status: 400
      });
      expect(service.getErrorMessage(error)).toBe('Error 1, Error 2');
    });

    it('should return status-based message for 401', () => {
      const error = new HttpErrorResponse({ status: 401 });
      expect(service.getErrorMessage(error)).toContain('not authorized');
    });

    it('should return status-based message for 404', () => {
      const error = new HttpErrorResponse({ status: 404 });
      expect(service.getErrorMessage(error)).toContain('not found');
    });

    it('should return status-based message for 500', () => {
      const error = new HttpErrorResponse({ status: 500 });
      expect(service.getErrorMessage(error)).toContain('server error');
    });

    it('should handle network errors (status 0)', () => {
      const error = new HttpErrorResponse({ status: 0 });
      expect(service.getErrorMessage(error)).toContain('connect to the server');
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');
      expect(service.getErrorMessage(error)).toBe('Generic error');
    });
  });

  describe('isRetryableError', () => {
    it('should return true for retryable status codes', () => {
      const error = new HttpErrorResponse({ status: 503 });
      expect(service.isRetryableError(error)).toBe(true);
    });

    it('should return false for non-retryable status codes', () => {
      const error = new HttpErrorResponse({ status: 404 });
      expect(service.isRetryableError(error)).toBe(false);
    });

    it('should return false for non-HTTP errors', () => {
      const error = new Error('Generic error');
      expect(service.isRetryableError(error)).toBe(false);
    });

    it('should respect custom retryable statuses', () => {
      const error = new HttpErrorResponse({ status: 404 });
      expect(service.isRetryableError(error, [404])).toBe(true);
    });
  });

  describe('logError', () => {
    it('should log error without throwing', () => {
      spyOn(console, 'error');
      const error = new Error('Test error');
      expect(() => service.logError(error, 'TestContext')).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should log HTTP error details', () => {
      spyOn(console, 'error');
      const error = new HttpErrorResponse({ 
        status: 500,
        url: '/api/test'
      });
      service.logError(error);
      expect(console.error).toHaveBeenCalledWith(
        jasmine.stringContaining('Error:'),
        error
      );
    });
  });
});
