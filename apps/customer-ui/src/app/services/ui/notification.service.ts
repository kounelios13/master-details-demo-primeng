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
    
    let errorMessage = customMessage || 'An error occurred';
    let errorDetail = '';

    if (error && typeof error === 'object') {
      const err = error as { status?: number; error?: { message?: string | string[] }; message?: string };
      
      // Handle different error formats
      if (err.error?.message) {
        if (Array.isArray(err.error.message)) {
          errorDetail = err.error.message.join(', ');
        } else {
          errorDetail = err.error.message;
        }
      } else if (err.message) {
        errorDetail = err.message;
      }

      // Customize message based on status code
      if (err.status === 401) {
        errorMessage = 'Authentication Failed';
        errorDetail = errorDetail || 'Please check your credentials and try again';
      } else if (err.status === 403) {
        errorMessage = 'Access Denied';
        errorDetail = errorDetail || 'You do not have permission to perform this action';
      } else if (err.status === 404) {
        errorMessage = 'Not Found';
        errorDetail = errorDetail || 'The requested resource was not found';
      } else if (err.status === 400) {
        errorMessage = 'Invalid Input';
      } else if (err.status && err.status >= 500) {
        errorMessage = 'Server Error';
        errorDetail = errorDetail || 'An unexpected error occurred. Please try again later';
      }
    }

    this.error(errorMessage, errorDetail);
  }
}
