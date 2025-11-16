# Copilot Instructions for Master-Details Demo with PrimeNG

## Project Overview

This is a **full-stack Nx monorepo** with an **Angular 19** frontend and **NestJS** backend, demonstrating a master-details pattern using **PrimeNG** UI components and **Reactive Forms**. The application showcases expandable table rows with inline editing capabilities, backed by a REST API with JWT authentication.

### Technology Stack

#### Frontend (customer-ui)
- **Angular 19** with standalone components
- **PrimeNG 19** for UI components (Table, Select, Button, Tooltip, Ripple, Dialog, Toast)
- **TypeScript 5.5** with strict mode enabled
- **Reactive Forms** with typed FormArrays and FormGroups
- **Jasmine & Karma** for unit testing
- **RxJS** for reactive programming

#### Backend (customer-api)
- **NestJS 11** for REST API framework
- **TypeORM** for database ORM
- **SQLite** for database (development)
- **JWT** for authentication
- **bcrypt** for password hashing
- **Swagger/OpenAPI** for API documentation
- **Jest** for unit testing
- **class-validator** for DTO validation

#### Tooling
- **Nx 22** for monorepo management and caching
- **ESLint** for linting
- **Prettier** for code formatting

### Key Architectural Patterns
- **Standalone components** (no NgModule)
- **Dependency injection** using `inject()` function
- **Typed reactive forms** with interfaces for form structure
- **Service-based data access** with Observable streams
- **Master-details pattern** with expandable rows
- **Change tracking** for form modifications

## Development Commands

### Setup
```bash
npm install          # Install dependencies
```

### Development
```bash
npm start           # Start dev server (nx serve) at http://localhost:4200
npm run watch       # Build and watch for changes
```

### Testing & Building
```bash
npm test                                                    # Run tests with Nx
npm test -- --browsers=ChromeHeadless --watch=false        # Run tests in CI mode
npm run build                                               # Production build
```

### Nx Commands
```bash
npx nx graph                    # View project dependency graph
npx nx show projects            # List all projects
npx nx run-many -t build        # Build all projects
npx nx affected -t test         # Test only affected projects
npx nx reset                    # Clear Nx cache
```

## Code Organization

### Nx Monorepo Structure
```
apps/
├── customer-ui/          # Angular 19 frontend application
│   └── src/app/
│       ├── components/   # Standalone components
│       ├── guards/       # Route guards (auth)
│       ├── interceptors/ # HTTP interceptors (auth, loader)
│       ├── models/       # TypeScript interfaces
│       ├── services/     # Injectable services
│       └── testing/      # Test utilities and mock data
│
├── customer-api/         # NestJS backend API
│   └── src/app/
│       ├── auth/         # Authentication module (JWT, Passport)
│       ├── customers/    # Customers module (CRUD operations)
│       ├── entities/     # TypeORM entities
│       ├── seed/         # Database seeding logic
│       ├── cli/          # CLI commands (seed-database)
│       └── common/       # Shared utilities (guards, filters, pipes)
│
└── libs/
    └── shared-models/    # Shared TypeScript models (Customer, Beneficiary)
```

### Frontend Structure (customer-ui)
```
src/app/
├── components/
│   ├── customer-table/   # Main table component with master-details
│   ├── login/            # Login page component
│   └── global-loader/    # Loading indicator component
├── services/
│   ├── api/              # API integration services
│   │   ├── auth.service.ts        # Authentication API calls
│   │   └── customer-api.service.ts # Customer CRUD API calls
│   └── ui/               # UI-specific services
│       ├── error-handling.service.ts  # Global error handling
│       ├── notification.service.ts    # Toast notifications
│       └── loader.service.ts          # Loading state
├── guards/
│   └── auth.guard.ts     # Route protection
└── interceptors/
    ├── auth.interceptor.ts    # Add JWT token to requests
    └── loader.interceptor.ts  # Show/hide loader
```

## Angular & PrimeNG Guidelines

### Component Structure
- Use **standalone components** with explicit imports
- Inject dependencies using the `inject()` function
- Define typed component properties
- Use `OnInit` lifecycle hook for initialization
- Use `OnDestroy` for cleanup (subscriptions, timers)

Example:
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
export class ExampleComponent implements OnInit {
  private myService = inject(MyService);
  
  ngOnInit(): void {
    // Initialization logic
  }
}
```

### Reactive Forms
- Use **typed FormGroups** with interfaces defining form structure
- Define form interfaces separately from data model interfaces
- Use `FormArray` for dynamic lists
- Implement change tracking when needed

Example:
```typescript
// Data model
export interface MyData {
  id: number;
  name: string;
}

// Form interface
export interface MyDataForm {
  id: FormControl<number>;
  name: FormControl<string>;
}

// In component
myForm = this.fb.group<MyDataForm>({
  id: this.fb.control(0, { nonNullable: true }),
  name: this.fb.control('', { nonNullable: true })
});
```

### PrimeNG Components
- Import specific PrimeNG modules (e.g., `TableModule`, `ButtonModule`, `SelectModule`)
- Configure theme in `app.config.ts` using `providePrimeNG()`
- Use PrimeNG's reactive form integration with `formControlName`
- Leverage PrimeNG directives like `pRipple`, `pTooltip`
- When using a `p-select` make sure to include `appendTo='body'` like this:
  ```html
     <p-select ... appendTo="body"/>
  ```

### Services
- Use `providedIn: 'root'` for singleton services
- Return Observables for asynchronous operations
- Use RxJS operators for data transformation
- Handle errors appropriately in subscriptions

## Testing Conventions

### Test Structure
- Place test files alongside source files with `.spec.ts` extension
- Use Jasmine for test framework
- Use Karma for test runner
- Aim for comprehensive test coverage

### Test Patterns
- Test component initialization and data loading
- Test form validation and user interactions
- Test service methods and observable streams
- Use mock data from `testing/mock-data.ts`
- Test edge cases and error scenarios

Example:
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Code Style & Conventions

### TypeScript
- Enable strict mode (already configured)
- Use explicit type annotations for function parameters and return types
- Use interfaces for object shapes
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- **Prefer fewer branches whenever possible to reduce nesting** - use early returns, guard clauses, and flat control flow

### Naming Conventions
- **Components**: PascalCase with descriptive names (`CustomerTableComponent`)
- **Services**: PascalCase ending with `Service` (`CustomerService`)
- **Interfaces**: PascalCase (`Customer`, `Beneficiary`)
- **Variables/Functions**: camelCase (`loadCustomers`, `answerOptions`)
- **Constants**: UPPER_SNAKE_CASE (`ANSWER_OPTIONS`)
- **Files**: kebab-case matching class name (`customer-table.component.ts`)

### Imports
- Group imports: Angular core, Angular modules, third-party, local
- Use absolute paths for imports within the project
- Remove unused imports

## When Creating a Pull Request

- Provide a clear and concise title that summarizes the changes made.
- Include a detailed description of the changes, including the purpose and any relevant context.
- Reference any related issues or tickets by including their numbers (e.g., "Fixes #123").
- Ensure that your code follows the project's coding standards and guidelines.
- Add appropriate labels to categorize the pull request (e.g., bug fix, feature, documentation).
- Ensure that all tests pass (`npm test`) and include new tests if applicable.
- Verify the build succeeds (`npm run build`) before submitting.

## When Creating a New Function or Method

- Write a clear JSDoc comment explaining the purpose, parameters, return values, and any exceptions.
- Include input validation where appropriate
- **Prefer fewer branches to reduce nesting** - use early returns for error conditions, guard clauses, and avoid deeply nested if/else statements.
- Follow the project's naming conventions and coding style.
- Include type annotations for all parameters and return values.
- Write unit tests to cover the new function or method, ensuring it behaves as expected.
- Avoid using overly complex logic; strive for simplicity and readability.
- Document any dependencies or external libraries used within the function or method.

## When Reviewing Code

### Security Critical Issues
- Check for hardcoded secrets, API keys, or credentials
- Look for SQL injection and XSS vulnerabilities
- Verify proper input validation and sanitization
- Review authentication and authorization logic

### Angular-Specific
- Verify proper component lifecycle usage
- Check for memory leaks (unsubscribed Observables)
- Ensure proper change detection strategy
- Verify accessibility attributes

### PrimeNG-Specific
- Verify correct PrimeNG module imports
- Check for proper theme configuration
- Ensure form controls are properly bound

## When Adding a New API Project (Nx Monorepo)

If tasked with creating a new API in this workspace:

1. **Create a new Nx project for the API:**
   ```bash
   npx nx g @nx/nest:application api-name
   ```

2. **Technology choices:**
   - Use **NestJS** for the API framework
   - Use **SQLite** for database (development/testing)
   - Implement **authentication** using JWT tokens
   - Use **bcrypt** (or better) for password hashing
   - Use **UUID v4** for entity IDs

3. **Write comprehensive unit tests** for all API endpoints

4. **Follow RESTful conventions** for API design

5. **Document API endpoints** with Swagger/OpenAPI

## NestJS API Testing (Jest)

### Test Structure
- Use **Jest** as the test framework for NestJS API
- Place test files alongside source files with `.spec.ts` extension
- Use `@nestjs/testing` for TestingModule setup
- Mock external dependencies using Jest mocks

### Test Patterns
```typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Coverage Goals
- Aim for **75%+ code coverage** for both UI and API
- Test happy paths and error scenarios
- Test input validation and DTOs
- Test authentication and authorization logic

## Environment Configuration

### API Configuration
- **Always use `.env` files** for environment-specific configuration
- **Never commit `.env` files** - use `.env.example` as template
- **Required environment variables** for API:
  - `JWT_SECRET` - Secure random string for JWT signing (required in production)
  - `SEED_USERNAME` - Username for database seeding
  - `SEED_PASSWORD` - Password for database seeding
  - `PORT` - API port (default: 3000)
  - `DATABASE_PATH` - SQLite database file path

Example `.env` file:
```bash
JWT_SECRET=your-secure-random-secret-key-here
SEED_USERNAME=admin
SEED_PASSWORD=admin123
PORT=3000
DATABASE_PATH=./database.sqlite
```

### UI Configuration
- Use `environment.ts` and `environment.prod.ts` for environment-specific settings
- Configure API base URL in environment files
- Use Angular's environment injection for accessing configuration

## Database and CLI Commands

### Database Seeding
To initialize the database with seed data:
```bash
npm run seed
```

**Important:** Ensure `SEED_USERNAME` and `SEED_PASSWORD` are set in `apps/customer-api/.env` before running the seed command.

### TypeORM Patterns
- Use **TypeORM entities** for database models
- Use **repositories** for data access
- Use **migrations** for schema changes (when needed)
- Entity IDs should use **UUID v4** format

Example entity:
```typescript
@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
```

## Form State Management

### Change Detection in Forms
- Track original values to detect unsaved changes
- Use a separate `originalAnswer` field to track the initial state
- When creating forms from API data, ensure `originalAnswer` defaults to current `answer` if not provided
- This prevents false "unsaved changes" warnings

Example:
```typescript
createBeneficiaryFormGroup(beneficiary: Beneficiary): FormGroup {
  return this.fb.group({
    answer: [beneficiary.answer],
    originalAnswer: [beneficiary.originalAnswer || beneficiary.answer]
  });
}
```

### Form Validation
- Add validators to FormControls as needed
- Display validation errors in the UI
- Disable save buttons when forms are invalid
- Use PrimeNG's form validation feedback components

## Common Pitfalls to Avoid

### Angular/PrimeNG
- **Don't forget to unsubscribe from Observables** in components (use `takeUntil`, `async` pipe, or `DestroyRef`)
- **Don't mutate form values directly** - use `patchValue()` or `setValue()`
- **Don't import entire PrimeNG library** - import specific modules only
- **Don't mix reactive and template-driven forms** - this project uses reactive forms
- **Don't forget to call `detectChanges()`** in tests after making changes
- **Don't modify mock data directly** in tests - create copies
- **Don't forget `appendTo="body"`** on `p-select` components to prevent overflow issues

### NestJS API
- **Don't commit sensitive data** like JWT secrets or passwords
- **Don't skip input validation** - always use DTOs with class-validator
- **Don't return raw errors** to clients - use proper exception filters
- **Don't forget to hash passwords** - never store plain text passwords
- **Don't skip API documentation** - use Swagger decorators

### Nx Monorepo
- **Don't run `npm install` in individual apps** - always install at root level
- **Use `--legacy-peer-deps`** when installing dependencies to avoid peer dependency conflicts
- **Use Nx commands** (`npx nx serve`, `npx nx test`) instead of Angular CLI directly
- **Clear Nx cache** (`npx nx reset`) if you encounter strange build issues

## Debugging Common Issues

### "Unknown file extension .ts" in Node.js 20+
- **Cause**: Node.js 20+ requires explicit loader configuration for TypeScript
- **Solution**: Use `ts-node` with proper tsconfig path:
  ```bash
  ts-node -P apps/customer-api/tsconfig.app.json script.ts
  ```

### Dropdown Overflow in Tables
- **Cause**: p-select dropdown is clipped by table cell overflow
- **Solution**: Add `appendTo="body"` to p-select components

### False "Unsaved Changes" Detection
- **Cause**: Missing or inconsistent `originalAnswer` values
- **Solution**: Default `originalAnswer` to current `answer` when creating forms

### CI Coverage Upload Fails
- **Cause**: Coverage not generated during test runs
- **Solution**: Add `--coverage` or `--code-coverage` flags to test commands

## CI/CD Guidelines

### GitHub Actions Workflow
- Run tests on **Node.js 18.x and 20.x** matrices
- Use `--legacy-peer-deps` for npm install
- Build and test in order: shared library → API → UI
- Generate coverage reports for all projects
- Use `--watch=false` and `--browsers=ChromeHeadless` for UI tests in CI

### Test Commands for CI
```bash
# Shared library
npx nx test shared-models --coverage

# API
npx nx test customer-api --coverage

# UI
npx nx test customer-ui --watch=false --browsers=ChromeHeadless --code-coverage
```

## Resources

- [Angular Documentation](https://angular.dev)
- [PrimeNG Documentation](https://primeng.org)
- [Nx Documentation](https://nx.dev)
- [RxJS Documentation](https://rxjs.dev)
- [NestJS Documentation](https://nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Jest Documentation](https://jestjs.io)
- **[Best Practices Guide](../../BEST_PRACTICES.md)** - See comprehensive API/UI best practices

## Testing Full-Stack Application

### Testing UI/API Integration
1. **First, start the API project:**
   ```bash
   npx nx serve customer-api
   ```
   The API will be available at `http://localhost:3000/api`

2. **Then, start the UI project:**
   ```bash
   npx nx serve customer-ui
   ```
   The UI will be available at `http://localhost:4200`

3. **Login credentials** (after running `npm run seed`):
   - Username: Value from `SEED_USERNAME` in `.env`
   - Password: Value from `SEED_PASSWORD` in `.env`

### API Documentation
- Swagger UI is available at: `http://localhost:3000/api/docs`
- Use this to explore and test API endpoints directly
