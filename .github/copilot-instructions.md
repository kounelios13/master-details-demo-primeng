# Copilot Instructions for Master-Details Demo with PrimeNG

## Project Overview

This is an **Angular 19** application demonstrating a master-details pattern using **PrimeNG** UI components and **Reactive Forms** with **Nx** monorepo management. The application showcases expandable table rows with inline editing capabilities.

### Technology Stack
- **Angular 19** with standalone components
- **PrimeNG 19** for UI components (Table, Select, Button, Tooltip, Ripple)
- **TypeScript 5.5** with strict mode enabled
- **Reactive Forms** with typed FormArrays and FormGroups
- **Nx 22** for monorepo tooling and caching
- **Jasmine & Karma** for testing (90 tests currently)
- **RxJS** for reactive programming

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

```
src/app/
├── components/           # Standalone components
│   ├── customer-table/   # Main table component with master-details
│   └── global-loader/    # Loading indicator component
├── models/              # TypeScript interfaces and types
│   └── customer.model.ts # Customer, Beneficiary, and typed form interfaces
├── services/            # Injectable services
│   ├── customer.service.ts  # Data access service
│   └── loader.service.ts    # Loading state management
└── testing/             # Test utilities and mock data
    └── mock-data.ts     # Mock customer data for testing
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
     <p-select ... apendTo="body"/>
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
- Use early returns for error conditions to reduce nesting where appropriate.
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

## Common Pitfalls to Avoid

- **Don't forget to unsubscribe from Observables** in components (use `takeUntil`, `async` pipe, or `DestroyRef`)
- **Don't mutate form values directly** - use `patchValue()` or `setValue()`
- **Don't import entire PrimeNG library** - import specific modules only
- **Don't mix reactive and template-driven forms** - this project uses reactive forms
- **Don't forget to call `detectChanges()`** in tests after making changes
- **Don't modify mock data directly** in tests - create copies

## Resources

- [Angular Documentation](https://angular.dev)
- [PrimeNG Documentation](https://primeng.org)
- [Nx Documentation](https://nx.dev)
- [RxJS Documentation](https://rxjs.dev)


# Testing bugs related to UI/API 
- Frst start the API project
- Then the customer-ui project
