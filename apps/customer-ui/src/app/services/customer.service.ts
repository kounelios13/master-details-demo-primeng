import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '@master-details-demo-primeng/shared-models';
import { CustomerApiService } from './api/customer-api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private customerApi: CustomerApiService) {}

  getCustomers(): Observable<Customer[]> {
    return this.customerApi.getCustomers();
  }

  getCustomer(id: number): Observable<Customer> {
    return this.customerApi.getCustomer(id);
  }

  createCustomer(customer: Omit<Customer, 'id'>): Observable<Customer> {
    return this.customerApi.createCustomer(customer);
  }

  updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
    return this.customerApi.updateCustomer(id, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.customerApi.deleteCustomer(id);
  }
}
