# Best Practices Guide

This document outlines the best practices implemented in this project for both API and UI development.

## Table of Contents
- [API Best Practices](#api-best-practices)
- [UI Best Practices](#ui-best-practices)
- [Security Best Practices](#security-best-practices)
- [Testing Best Practices](#testing-best-practices)

## API Best Practices

### 1. Input Validation with DTOs

We use **class-validator** and **class-transformer** for robust input validation:

```typescript
// DTO Example: CreateCustomerDto
export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ description: 'Customer email', example: 'john@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
```

**Benefits:**
- Automatic validation of incoming requests
- Clear, user-friendly error messages
- Type-safe DTOs
- API documentation generation

### 2. API Documentation with Swagger

All endpoints are documented using Swagger/OpenAPI:

```typescript
@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'List retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(): Promise<Customer[]> {
    // ...
  }
}
```

**Access Swagger UI:** `http://localhost:3000/api/docs`

### 3. Global Exception Handling

Custom exception filter provides consistent error responses:

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Formats all errors consistently
    // Logs errors for debugging
    // Returns structured error response
  }
}
```

**Error Response Format:**
```json
{
  "statusCode": 400,
  "timestamp": "2025-11-09T16:30:00.000Z",
  "path": "/api/customers",
  "method": "POST",
  "error": "Bad Request",
  "message": ["Name is required", "Email is invalid"]
}
```

### 4. Request/Response Logging

Logging interceptor tracks all HTTP requests:

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // Logs: method, URL, status code, response time
  }
}
```

**Example log:**
```
POST /api/customers 201 - 45ms
GET /api/customers 200 - 12ms
```

### 5. Proper HTTP Status Codes

- **200 OK** - Successful GET/PUT
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Authentication required
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server errors

### 6. ParseIntPipe for URL Parameters

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  // Automatically validates and transforms id to number
}
```

## UI Best Practices

### 1. Notification Service

Centralized service for user feedback using PrimeNG Toast:

```typescript
export class NotificationService {
  success(summary: string, detail?: string): void { }
  error(summary: string, detail?: string): void { }
  warning(summary: string, detail?: string): void { }
  info(summary: string, detail?: string): void { }
  
  // Smart error handling from HTTP responses
  handleError(error: unknown, customMessage?: string): void { }
}
```

**Usage:**
```typescript
this.notificationService.success('Saved', 'Customer created successfully');
this.notificationService.handleError(error, 'Failed to save customer');
```

### 2. Error Handling Service

Advanced error handling with retry logic:

```typescript
export class ErrorHandlingService {
  // Extract user-friendly messages from HTTP errors
  getErrorMessage(error: unknown): string { }
  
  // Determine if error is retryable
  isRetryableError(error: unknown): boolean { }
  
  // Apply retry logic to HTTP requests
  withRetry<T>(source$: Observable<T>): Observable<T> { }
}
```

**Retry Configuration:**
```typescript
const config = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};

this.errorHandler.withRetry(this.http.get('/api/data'), config);
```

### 3. PrimeNG Confirm Dialogs

Replace native `confirm()` with styled dialogs:

```typescript
this.confirmationService.confirm({
  message: `Are you sure you want to delete ${name}?`,
  header: 'Confirm Deletion',
  icon: 'pi pi-exclamation-triangle',
  acceptLabel: 'Yes, Delete',
  rejectLabel: 'Cancel',
  acceptButtonStyleClass: 'p-button-danger',
  accept: () => {
    // Perform deletion
  }
});
```

**Benefits:**
- Consistent styling
- Customizable buttons and icons
- Better UX than browser dialogs
- Themeable

### 4. Smart Error Messages

Status code-based error messages:

| Status | User Message |
|--------|-------------|
| 0 | "Unable to connect to the server" |
| 400 | "Invalid request" |
| 401 | "You are not authorized" |
| 403 | "You do not have permission" |
| 404 | "Resource not found" |
| 500 | "Server error occurred" |

### 5. Form Validation Feedback

Always provide user feedback on form submission:

```typescript
saveCustomer(): void {
  if (this.customerForm.invalid) {
    this.notificationService.warning(
      'Invalid Form', 
      'Please fill in all required fields'
    );
    return;
  }
  // Proceed with save
}
```

### 6. JSDoc Comments

Document all public methods:

```typescript
/**
 * Delete a customer with confirmation dialog
 * @param customerIndex - Index of customer in form array
 */
deleteCustomer(customerIndex: number): void {
  // Implementation
}
```

## Security Best Practices

### 1. Environment Variables

Never hardcode secrets:

```typescript
// ❌ Bad
const JWT_SECRET = 'my-secret-key';

// ✅ Good
const JWT_SECRET = process.env['JWT_SECRET'];
```

### 2. JWT Authentication

- Use HTTP-only cookies or secure storage
- Include Bearer token in Authorization header
- Validate tokens on every protected endpoint

### 3. Password Security

- Hash passwords with bcrypt (10+ salt rounds)
- Never log or expose passwords
- Enforce minimum password length

### 4. Input Sanitization

- Validate all user inputs
- Use DTOs with class-validator
- Whitelist allowed properties
- Reject unknown properties

### 5. CORS Configuration

```typescript
app.enableCors({
  origin: process.env['ALLOWED_ORIGINS']?.split(','),
  credentials: true
});
```

## Testing Best Practices

### 1. Test Coverage

- Unit tests for services
- Component tests for UI
- Integration tests for APIs
- E2E tests for critical flows

### 2. Mock Dependencies

```typescript
const customerServiceSpy = jasmine.createSpyObj('CustomerService', [
  'getCustomers',
  'createCustomer'
]);

TestBed.configureTestingModule({
  providers: [
    { provide: CustomerService, useValue: customerServiceSpy }
  ]
});
```

### 3. Test Services Separately

Test notification and error handling services independently:

```typescript
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
```

### 4. Provide All Dependencies

Always provide MessageService, ConfirmationService, etc. in tests:

```typescript
TestBed.configureTestingModule({
  providers: [
    MessageService,
    ConfirmationService,
    // ... other services
  ]
});
```

## Code Quality

### 1. Linting

Run linter before committing:

```bash
npx nx lint customer-api
npx nx lint customer-ui
```

### 2. Type Safety

- Enable strict TypeScript mode
- Avoid `any` types
- Use interfaces for data models
- Use typed reactive forms

### 3. Consistent Naming

- `camelCase` for variables and methods
- `PascalCase` for classes and interfaces
- `kebab-case` for file names
- Descriptive names over short names

### 4. Single Responsibility

Each class/function should have one clear purpose:

```typescript
// ✅ Good - Single responsibility
export class NotificationService {
  // Only handles notifications
}

export class ErrorHandlingService {
  // Only handles error processing
}
```

## Performance

### 1. Lazy Loading

Load modules on demand:

```typescript
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.module')
}
```

### 2. Change Detection

Use OnPush strategy when possible:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 3. Unsubscribe from Observables

Prevent memory leaks:

```typescript
ngOnDestroy(): void {
  this.subscriptions.unsubscribe();
}
```

### 4. Retry Logic

Use retry strategies for transient failures:

```typescript
this.errorHandler.withRetry(this.http.get('/api/data'), {
  maxRetries: 3,
  retryDelay: 1000
});
```

## Accessibility

### 1. ARIA Labels

Add labels for screen readers:

```html
<button aria-label="Delete customer" (click)="delete()">
  <i class="pi pi-trash"></i>
</button>
```

### 2. Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```html
<div role="button" tabindex="0" (keydown.enter)="onClick()">
```

### 3. Color Contrast

Use sufficient contrast ratios (WCAG AA: 4.5:1)

### 4. Form Labels

Associate labels with inputs:

```html
<label for="customer-name">Name</label>
<input id="customer-name" formControlName="name">
```

## Summary

This project implements industry-standard best practices for:

✅ **API Development** - DTOs, validation, Swagger docs, error handling  
✅ **UI Development** - Notifications, error handling, confirm dialogs  
✅ **Security** - JWT auth, password hashing, input validation  
✅ **Testing** - Unit tests, component tests, proper mocking  
✅ **Code Quality** - Linting, TypeScript strict mode, documentation  
✅ **User Experience** - User-friendly messages, loading states, confirmations

For more details, see the inline code comments and respective service implementations.
