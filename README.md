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

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests

## Technologies

- **Angular 19** - Latest Angular framework with standalone components
- **PrimeNG 19** - Rich UI component library
- **TypeScript 5.5** - Typed superset of JavaScript
- **Reactive Forms** - Angular's model-driven form approach

## License

This project is open source and available under the MIT License.