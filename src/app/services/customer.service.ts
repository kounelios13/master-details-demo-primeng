import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Customer } from '../models/customer.model';
import { MOCK_CUSTOMERS } from '../testing/mock-data';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  getCustomers(): Observable<Customer[]> {
    return of(MOCK_CUSTOMERS).pipe(
      delay(1500)
    );
  }
}
