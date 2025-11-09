import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessageService]
    });
    service = TestBed.inject(NotificationService);
    messageService = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should display success notification', () => {
    spyOn(messageService, 'add');
    service.success('Success', 'Operation completed');
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Operation completed',
      life: 3000
    });
  });

  it('should display error notification', () => {
    spyOn(messageService, 'add');
    service.error('Error', 'Something went wrong');
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Something went wrong',
      life: 5000
    });
  });

  it('should display warning notification', () => {
    spyOn(messageService, 'add');
    service.warning('Warning', 'Be careful');
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Be careful',
      life: 4000
    });
  });

  it('should display info notification', () => {
    spyOn(messageService, 'add');
    service.info('Info', 'Here is some information');
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Info',
      detail: 'Here is some information',
      life: 3000
    });
  });

  it('should clear all notifications', () => {
    spyOn(messageService, 'clear');
    service.clear();
    expect(messageService.clear).toHaveBeenCalled();
  });

  it('should handle HTTP 401 error', () => {
    spyOn(messageService, 'add');
    const error = { status: 401, error: { message: 'Invalid token' } };
    service.handleError(error);
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Authentication Failed'
      })
    );
  });

  it('should handle HTTP 404 error', () => {
    spyOn(messageService, 'add');
    const error = { status: 404 };
    service.handleError(error);
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Not Found'
      })
    );
  });

  it('should handle HTTP 500 error', () => {
    spyOn(messageService, 'add');
    const error = { status: 500 };
    service.handleError(error);
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Server Error'
      })
    );
  });

  it('should handle array of error messages', () => {
    spyOn(messageService, 'add');
    const error = { 
      status: 400,
      error: { message: ['Field 1 is required', 'Field 2 is invalid'] }
    };
    service.handleError(error);
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        detail: 'Field 1 is required, Field 2 is invalid'
      })
    );
  });
});
