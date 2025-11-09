import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, finalize, retryWhen } from 'rxjs/operators';

/**
 * Configuration for retry logic
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses?: number[];
}

/**
 * Service providing centralized error handling utilities
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  
  /**
   * Default retry configuration
   */
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  };

  /**
   * Extract user-friendly error message from HTTP error
   * @param error - HTTP error response
   * @returns User-friendly error message
   */
  getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      // Server-side error
      if (error.error?.message) {
        if (Array.isArray(error.error.message)) {
          return error.error.message.join(', ');
        }
        return error.error.message;
      }

      // HTTP status-based messages
      switch (error.status) {
        case 0:
          return 'Unable to connect to the server. Please check your internet connection.';
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'You are not authorized. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'A conflict occurred. The resource may have been modified.';
        case 422:
          return 'The data provided is invalid or incomplete.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'A server error occurred. Please try again later.';
        case 502:
        case 503:
        case 504:
          return 'The server is temporarily unavailable. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred.';
  }

  /**
   * Determine if an error is retryable based on status code
   * @param error - HTTP error response
   * @param retryableStatuses - Array of status codes that should trigger a retry
   * @returns True if error should be retried
   */
  isRetryableError(error: unknown, retryableStatuses?: number[]): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    const statuses = retryableStatuses || this.defaultRetryConfig.retryableStatuses || [];
    return statuses.includes(error.status);
  }

  /**
   * Create a retry strategy for HTTP requests
   * @param config - Retry configuration
   * @returns RxJS operator for retrying failed requests
   */
  createRetryStrategy(config?: Partial<RetryConfig>) {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    
    return (errors: Observable<unknown>) =>
      errors.pipe(
        mergeMap((error, index) => {
          const retryAttempt = index + 1;
          
          // Check if we've exceeded max retries or if error is not retryable
          if (
            retryAttempt > retryConfig.maxRetries ||
            !this.isRetryableError(error, retryConfig.retryableStatuses)
          ) {
            return throwError(() => error);
          }

          console.log(
            `Retry attempt ${retryAttempt}/${retryConfig.maxRetries} after ${retryConfig.retryDelay}ms`
          );

          // Exponential backoff
          const delay = retryConfig.retryDelay * Math.pow(2, retryAttempt - 1);
          return timer(delay);
        })
      );
  }

  /**
   * Apply retry logic to an HTTP request observable
   * @param source$ - Source observable
   * @param config - Retry configuration
   * @returns Observable with retry logic applied
   */
  withRetry<T>(source$: Observable<T>, config?: Partial<RetryConfig>): Observable<T> {
    return source$.pipe(
      retryWhen(this.createRetryStrategy(config)),
      finalize(() => console.log('Request completed'))
    );
  }

  /**
   * Log error for debugging
   * @param error - Error to log
   * @param context - Context information
   */
  logError(error: unknown, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    
    console.error(`${timestamp} ${contextStr} Error:`, error);
    
    if (error instanceof HttpErrorResponse) {
      console.error('Status:', error.status);
      console.error('URL:', error.url);
      console.error('Message:', this.getErrorMessage(error));
    }
  }
}
