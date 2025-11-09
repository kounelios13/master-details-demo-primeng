import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, Beneficiary } from '@master-details-demo-primeng/shared-models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
  }

  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${id}`);
  }

  createCustomer(customer: Omit<Customer, 'id'>): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, customer);
  }

  updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/customers/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customers/${id}`);
  }

  addBeneficiary(customerId: number, beneficiary: Omit<Beneficiary, 'id'>): Observable<Beneficiary> {
    return this.http.post<Beneficiary>(`${this.apiUrl}/customers/${customerId}/beneficiaries`, beneficiary);
  }

  updateBeneficiary(beneficiaryId: number, beneficiary: Partial<Beneficiary>): Observable<Beneficiary> {
    return this.http.put<Beneficiary>(`${this.apiUrl}/customers/beneficiaries/${beneficiaryId}`, beneficiary);
  }

  deleteBeneficiary(beneficiaryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customers/beneficiaries/${beneficiaryId}`);
  }
}
