import { TestBed } from '@angular/core/testing';
import { CustomerService } from './customer.service';
import { Customer } from '../models/customer.model';

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCustomers', () => {
    it('should return an Observable', () => {
      const result = service.getCustomers();
      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
    });

    it('should return customers array with delay', (done) => {
      const startTime = Date.now();
      
      service.getCustomers().subscribe({
        next: (customers: Customer[]) => {
          const endTime = Date.now();
          const elapsed = endTime - startTime;
          
          expect(customers).toBeDefined();
          expect(Array.isArray(customers)).toBe(true);
          expect(customers.length).toBeGreaterThan(0);
          expect(elapsed).toBeGreaterThanOrEqual(1400);
          done();
        },
        error: () => {
          fail('Should not throw error');
          done();
        }
      });
    });

    it('should return customers with correct structure', (done) => {
      service.getCustomers().subscribe({
        next: (customers: Customer[]) => {
          expect(customers.length).toBe(5);
          
          const firstCustomer = customers[0];
          expect(firstCustomer.id).toBeDefined();
          expect(firstCustomer.name).toBeDefined();
          expect(firstCustomer.email).toBeDefined();
          expect(firstCustomer.company).toBeDefined();
          expect(firstCustomer.beneficiaries).toBeDefined();
          expect(Array.isArray(firstCustomer.beneficiaries)).toBe(true);
          
          done();
        }
      });
    });

    it('should return customers with beneficiaries', (done) => {
      service.getCustomers().subscribe({
        next: (customers: Customer[]) => {
          customers.forEach(customer => {
            expect(customer.beneficiaries.length).toBeGreaterThan(0);
            
            customer.beneficiaries.forEach(beneficiary => {
              expect(beneficiary.id).toBeDefined();
              expect(beneficiary.name).toBeDefined();
              expect(beneficiary.question).toBeDefined();
              expect(beneficiary.answer).toBeDefined();
              expect(beneficiary.originalAnswer).toBeDefined();
            });
          });
          
          done();
        }
      });
    });

    it('should return same data on multiple calls', (done) => {
      let firstResult: Customer[];
      
      service.getCustomers().subscribe({
        next: (customers: Customer[]) => {
          firstResult = customers;
          
          service.getCustomers().subscribe({
            next: (customersAgain: Customer[]) => {
              expect(customersAgain.length).toBe(firstResult.length);
              expect(customersAgain[0].id).toBe(firstResult[0].id);
              expect(customersAgain[0].name).toBe(firstResult[0].name);
              done();
            }
          });
        }
      });
    });
  });
});
