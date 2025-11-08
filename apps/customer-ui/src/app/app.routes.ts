import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CustomerTableComponent } from './components/customer-table/customer-table.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'customers', component: CustomerTableComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
];
