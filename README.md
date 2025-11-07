# Master-Details Demo with PrimeNG

Angular 19 application demonstrating master-details pattern with reactive forms and PrimeNG table components.

## Features

- ✅ Angular 19 with standalone components
- ✅ PrimeNG table with expandable rows (master-details pattern)
- ✅ Reactive Forms with nested FormArrays
- ✅ Inline editing with dropdowns
- ✅ Change tracking and validation
- ✅ Individual and bulk save operations
- ✅ Reset functionality for unsaved changes
- ✅ Nx monorepo for scalable development

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kounelios13/master-details-demo-primeng.git
cd master-details-demo-primeng
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200`

## Nx Workspace

This project uses **Nx** for monorepo management, providing:
- **Intelligent caching** - Builds and tests are cached for faster execution
- **Project graph** - Understand dependencies between projects
- **Generators** - Scaffold new applications and libraries quickly
- **Scalability** - Easy to add new projects (APIs, libraries, etc.)

### Adding a New API Project

To add a new API project to this workspace:

```bash
# For a Node.js/Express API
npx nx g @nx/express:application api

# For a NestJS API
npx nx g @nx/nest:application api
```

### Working with Multiple Projects

```bash
# Run commands for specific projects
npx nx build master-details-demo-primeng
npx nx test master-details-demo-primeng

# Run commands for all projects
npx nx run-many -t build
npx nx run-many -t test

# View the project graph
npx nx graph
```

## Project Structure

```
src/
├── app/
│   ├── models/
│   │   └── customer.model.ts          # Data models and interfaces
│   ├── components/
│   │   └── customer-table/
│   │       ├── customer-table.component.ts
│   │       ├── customer-table.component.html
│   │       └── customer-table.component.css
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.config.ts
│   └── app.routes.ts
├── index.html
├── main.ts
└── styles.css

Configuration files:
├── nx.json               # Nx workspace configuration
├── project.json          # Project-specific configuration
└── package.json          # Dependencies and scripts
```

## Usage

### Master Table
- View list of customers
- See beneficiary count and change status
- Expand rows to see beneficiary details

### Details Grid (Beneficiaries)
- Edit beneficiary answers using dropdowns
- Save individual changes with the check button
- Reset individual changes with the refresh button
- Save all changes for a customer with "Save All Changes" button
- Visual indicators for changed rows

## Key Concepts

### Reactive Forms Structure
The application uses nested FormArrays:
```
FormGroup (customersForm)
  └── FormArray (customers)
      └── FormGroup (customer)
          └── FormArray (beneficiaries)
              └── FormGroup (beneficiary)
```

### Change Tracking
Each beneficiary stores its original answer, allowing the application to:
- Detect which fields have changed
- Enable/disable action buttons accordingly
- Reset changes to original values
- Show visual indicators for modified rows

## Available Scripts

- `npm start` - Start development server (uses Nx)
- `npm run build` - Build for production (uses Nx with caching)
- `npm run watch` - Build and watch for changes (uses Nx)
- `npm test` - Run unit tests (uses Nx with caching)

### Nx-Specific Commands

- `npx nx graph` - View the interactive project dependency graph
- `npx nx show projects` - List all projects in the workspace
- `npx nx run-many -t build` - Build all projects
- `npx nx affected -t test` - Test only affected projects
- `npx nx reset` - Clear Nx cache

## Technologies

- **Angular 19** - Latest Angular framework with standalone components
- **PrimeNG 19** - Rich UI component library
- **TypeScript 5.5** - Typed superset of JavaScript
- **Reactive Forms** - Angular's model-driven form approach
- **Nx 22** - Smart monorepo build system with caching

## License

This project is open source and available under the MIT License.