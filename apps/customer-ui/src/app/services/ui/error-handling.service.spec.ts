import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    it('should log error without context', () => {
      spyOn(console, 'error');
      const error = new Error('Test error');
      service.logError(error);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getErrorMessage - additional branches', () => {
    it('should return message for 400 status', () => {
      const error = new HttpErrorResponse({ status: 400 });
      expect(service.getErrorMessage(error)).toContain('Invalid request');
    });

    it('should return message for 403 status', () => {
      const error = new HttpErrorResponse({ status: 403 });
      expect(service.getErrorMessage(error)).toContain('not have permission');
    });

    it('should return message for 409 status', () => {
      const error = new HttpErrorResponse({ status: 409 });
      expect(service.getErrorMessage(error)).toContain('conflict occurred');
    });

    it('should return message for 422 status', () => {
      const error = new HttpErrorResponse({ status: 422 });
      expect(service.getErrorMessage(error)).toContain('invalid or incomplete');
    });

    it('should return message for 429 status', () => {
      const error = new HttpErrorResponse({ status: 429 });
      expect(service.getErrorMessage(error)).toContain('Too many requests');
    });

    it('should return message for 502 status', () => {
      const error = new HttpErrorResponse({ status: 502 });
      expect(service.getErrorMessage(error)).toContain('temporarily unavailable');
    });

    it('should return message for 503 status', () => {
      const error = new HttpErrorResponse({ status: 503 });
      expect(service.getErrorMessage(error)).toContain('temporarily unavailable');
    });

    it('should return message for 504 status', () => {
      const error = new HttpErrorResponse({ status: 504 });
      expect(service.getErrorMessage(error)).toContain('temporarily unavailable');
    });

    it('should return default message for unknown status', () => {
      const error = new HttpErrorResponse({ status: 418, statusText: 'I am a teapot' });
      const message = service.getErrorMessage(error);
      expect(message).toContain('failure');
    });

    it('should return message for non-Error objects', () => {
      const result = service.getErrorMessage({ some: 'object' });
      expect(result).toBe('An unexpected error occurred.');
    });
  });

  describe('createRetryStrategy', () => {
    it('should create retry strategy with default config', (done) => {
      const strategy = service.createRetryStrategy();
      expect(strategy).toBeDefined();
      done();
    });

    it('should create retry strategy with custom config', (done) => {
      const strategy = service.createRetryStrategy({ maxRetries: 5, retryDelay: 500 });
      expect(strategy).toBeDefined();
      done();
    });
  });

  describe('withRetry', () => {
    it('should apply retry logic to observable', (done) => {
      const mockObservable = new Observable((subscriber) => {
        subscriber.next('success');
        subscriber.complete();
      });

      service.withRetry(mockObservable).subscribe({
        next: (value) => {
          expect(value).toBe('success');
        },
        complete: () => {
          // finalize runs asynchronously
          setTimeout(() => {
            done();
          }, 10);
        }
      });
    });

    it('should apply retry logic with custom config', (done) => {
      const mockObservable = new Observable((subscriber) => {
        subscriber.next('success');
        subscriber.complete();
      });

      service.withRetry(mockObservable, { maxRetries: 2, retryDelay: 100 }).subscribe({
        next: (value) => {
          expect(value).toBe('success');
        },
        complete: () => {
          // finalize runs asynchronously
          setTimeout(() => {
            done();
          }, 10);
        }
      });
    });
  });
});
