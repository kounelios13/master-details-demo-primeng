# Master-Details Demo with PrimeNG - Nx Monorepo

Angular 19 + NestJS full-stack application demonstrating master-details pattern with reactive forms, REST API, and JWT authentication.

## Architecture Overview

This project is organized as an **Nx monorepo** with clear separation of concerns:

```
apps/
├── customer-ui/          # Angular 19 frontend application
└── customer-api/         # NestJS backend API with SQLite database

libs/
└── shared-models/        # Shared TypeScript models used by both frontend and backend
```

## Features

### Frontend (Angular)
- ✅ Angular 19 with standalone components
- ✅ PrimeNG table with expandable rows (master-details pattern)
- ✅ Reactive Forms with nested FormArrays
- ✅ JWT authentication with login page
- ✅ HTTP client integration with REST API
- ✅ Inline editing with dropdowns
- ✅ Change tracking and validation
- ✅ Individual and bulk save operations
- ✅ Reset functionality for unsaved changes

### Backend (NestJS)
- ✅ NestJS REST API
- ✅ SQLite database with TypeORM
- ✅ JWT authentication with Passport
- ✅ Password hashing with bcrypt
- ✅ Automatic database seeding
- ✅ Protected API endpoints
- ✅ CORS enabled

### Shared
- ✅ TypeScript models shared between frontend and backend
- ✅ Nx monorepo for scalable development with intelligent caching

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

## Running the Application

### Start the Backend API

```bash
npx nx serve customer-api
```

The API will start on `http://localhost:3000/api`

On first run, the database will be automatically seeded with:
- **Demo user credentials:** `username: demo`, `password: demo123`
- Sample customer data with beneficiaries

### Start the Frontend UI

```bash
npx nx serve customer-ui
```

The UI will start on `http://localhost:4200`

### Login

Navigate to `http://localhost:4200` and login with:
- **Username:** demo
- **Password:** demo123

## API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "demo",
  "password": "demo123"
}
```

Response:
```json
{
  "access_token": "jwt-token-string",
  "username": "demo"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123"
}
```

### Customer Endpoints

All customer endpoints require JWT authentication via Bearer token.

#### Get all customers
```http
GET /api/customers
Authorization: Bearer {jwt-token}
```

#### Get a single customer
```http
GET /api/customers/:id
Authorization: Bearer {jwt-token}
```

#### Create a customer
```http
POST /api/customers
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "beneficiaries": []
}
```

#### Update a customer
```http
PUT /api/customers/:id
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "name": "John Doe Updated"
}
```

#### Delete a customer
```http
DELETE /api/customers/:id
Authorization: Bearer {jwt-token}
```

## Building for Production

Build all projects:
```bash
npx nx run-many --target=build --all
```

Build individual projects:
```bash
npx nx build customer-api
npx nx build customer-ui
```

## Running Tests

Run all tests:
```bash
npx nx run-many --target=test --all
```

Run tests for specific project:
```bash
npx nx test customer-api
npx nx test customer-ui
```

## Project Structure

```
apps/customer-api/
├── src/
│   ├── app/
│   │   ├── auth/              # JWT authentication module
│   │   ├── customers/         # Customer management module
│   │   ├── entities/          # TypeORM entities
│   │   └── seed/              # Database seeding service
│   └── main.ts

apps/customer-ui/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── customer-table/    # Main table component
│   │   │   └── login/             # Login component
│   │   ├── guards/                # Route guards
│   │   ├── models/                # TypeScript interfaces
│   │   ├── services/
│   │   │   └── api/               # API service layer
│   │   └── app.routes.ts
│   └── environments/              # Environment configuration

libs/shared-models/
└── src/
    └── lib/
        └── customer.model.ts      # Shared type definitions
```

## Database

The application uses SQLite for data persistence. The database file is located at `data/database.sqlite`.

### Schema

- **users**: User authentication (id, username, password)
- **customers**: Customer information (id, name, email, company)
- **beneficiaries**: Customer beneficiaries (id, name, question, answer, originalAnswer, customerId)

### Seeded Data

On first run, the database is seeded with:
- 1 demo user (username: demo, password: demo123)
- 5 customers with various beneficiaries

## Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Protected API routes with JWT guard
- CORS enabled for frontend communication
- HTTP-only authentication flow

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

## Nx Workspace Commands

### Development
- `npx nx serve customer-api` - Start the backend API
- `npx nx serve customer-ui` - Start the frontend application
- `npx nx graph` - View the interactive project dependency graph

### Building
- `npx nx build customer-api` - Build the API
- `npx nx build customer-ui` - Build the UI
- `npx nx run-many -t build` - Build all projects

### Testing
- `npx nx test customer-api` - Test the API
- `npx nx test customer-ui` - Test the UI
- `npx nx run-many -t test` - Test all projects
- `npx nx affected -t test` - Test only affected projects

### Other Commands
- `npx nx show projects` - List all projects
- `npx nx reset` - Clear Nx cache

## Technologies

### Frontend
- **Angular 19** - Latest Angular framework with standalone components
- **PrimeNG 19** - Rich UI component library
- **TypeScript 5.5** - Typed superset of JavaScript
- **Reactive Forms** - Angular's model-driven form approach

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript and JavaScript
- **SQLite** - Lightweight SQL database
- **Passport JWT** - Authentication middleware
- **bcrypt** - Password hashing

### Build System
- **Nx 22** - Smart monorepo build system with caching

## Troubleshooting

### Database Issues
If you encounter database errors, delete the database file and restart the API:
```bash
rm data/database.sqlite
npx nx serve customer-api
```

### Port Conflicts
If ports 3000 or 4200 are already in use:

**API:**
```bash
PORT=3001 npx nx serve customer-api
```

**UI:**
```bash
npx nx serve customer-ui --port 4201
```

Then update `apps/customer-ui/src/environments/environment.ts` with the new API URL.

## License

This project is open source and available under the MIT License.
