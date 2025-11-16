import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Service for displaying user notifications using PrimeNG Toast
 * Provides consistent, user-friendly feedback for operations
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  /**
   * Display a success notification
   * @param summary - Main message title
   * @param detail - Detailed message (optional)
   * @param life - Duration in milliseconds (default: 3000)
   */
  success(summary: string, detail?: string, life = 3000): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life
    });
  }

  /**
   * Display an error notification
   * @param summary - Main message title
   * @param detail - Detailed message (optional)
   * @param life - Duration in milliseconds (default: 5000)
   */
  error(summary: string, detail?: string, life = 5000): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life
    });
  }

  /**
   * Display a warning notification
   * @param summary - Main message title
   * @param detail - Detailed message (optional)
   * @param life - Duration in milliseconds (default: 4000)
   */
  warning(summary: string, detail?: string, life = 4000): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life
    });
  }

  /**
   * Display an info notification
   * @param summary - Main message title
   * @param detail - Detailed message (optional)
   * @param life - Duration in milliseconds (default: 3000)
   */
  info(summary: string, detail?: string, life = 3000): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life
    });
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Handle HTTP errors and display appropriate user-friendly messages
   * @param error - HTTP error response
   * @param customMessage - Optional custom message to override default
   */
  handleError(error: unknown, customMessage?: string): void {
    console.error('Error occurred:', error);
    
    const errorInfo = this.extractErrorInfo(error, customMessage);
    this.error(errorInfo.message, errorInfo.detail);
  }

  /**
   * Extract error information from error object
   * Separated for better testability and reduced complexity
   * @param error - Error object
   * @param customMessage - Optional custom message
   * @returns Object with message and detail
   */
  private extractErrorInfo(error: unknown, customMessage?: string): { message: string; detail: string } {
    const defaultMessage = customMessage || 'An error occurred';
    
    if (!error || typeof error !== 'object') {
      return { message: defaultMessage, detail: '' };
    }

    const err = error as { status?: number; error?: { message?: string | string[] }; message?: string };
    const detail = this.extractErrorDetail(err);
    const message = this.getStatusBasedMessage(err.status, defaultMessage);
    
    return { message, detail: this.enhanceDetailForStatus(err.status, detail) };
  }

  /**
   * Extract error detail from error object
   * @param err - Error object with potential message properties
   * @returns Error detail string
   */
  private extractErrorDetail(err: { error?: { message?: string | string[] }; message?: string }): string {
    if (err.error?.message) {
      return Array.isArray(err.error.message) 
        ? err.error.message.join(', ') 
        : err.error.message;
    }
    return err.message || '';
  }

  /**
   * Get user-friendly message based on HTTP status code
   * @param status - HTTP status code
   * @param defaultMessage - Default message to use
   * @returns User-friendly message
   */
  private getStatusBasedMessage(status: number | undefined, defaultMessage: string): string {
    if (!status) return defaultMessage;

    const statusMessages: Record<number, string> = {
      400: 'Invalid Input',
      401: 'Authentication Failed',
      403: 'Access Denied',
      404: 'Not Found'
    };

    if (status >= 500) return 'Server Error';
    return statusMessages[status] || defaultMessage;
  }

  /**
   * Enhance error detail with default message for specific status codes
   * @param status - HTTP status code
   * @param detail - Current detail message
   * @returns Enhanced detail message
   */
  private enhanceDetailForStatus(status: number | undefined, detail: string): string {
    if (detail) return detail;
    if (!status) return '';

    const defaultDetails: Record<number, string> = {
      401: 'Please check your credentials and try again',
      403: 'You do not have permission to perform this action',
      404: 'The requested resource was not found'
    };

    if (status >= 500) {
      return 'An unexpected error occurred. Please try again later';
    }

    return defaultDetails[status] || '';
  }
}
