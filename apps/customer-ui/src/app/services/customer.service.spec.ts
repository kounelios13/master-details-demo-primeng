import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { CustomerApiService } from './api/customer-api.service';
import { AuthService } from './api/auth.service';
import { Customer } from '@master-details-demo-primeng/shared-models';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CustomerService,
        CustomerApiService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCustomers', () => {
    it('should return an Observable', (done) => {
      const result = service.getCustomers();
      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
      
      // Subscribe to trigger the HTTP request
      result.subscribe(() => {
        done();
      });
      
      const req = httpMock.expectOne('http://localhost:3000/api/customers');
      req.flush([]);
    });

    it('should return customers array from API', (done) => {
      const mockCustomers: Customer[] = [
        {
          id: 1,
          name: 'Test Customer',
          email: 'test@example.com',
          company: 'Test Corp',
          beneficiaries: []
        }
      ];

      service.getCustomers().subscribe({
        next: (customers: Customer[]) => {
          expect(customers).toBeDefined();
          expect(Array.isArray(customers)).toBe(true);
          expect(customers.length).toBe(1);
          expect(customers[0].name).toBe('Test Customer');
          done();
        },
        error: () => {
          fail('Should not throw error');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/customers');
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomers);
    });

    it('should return customers with correct structure', (done) => {
      const mockCustomers: Customer[] = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Acme Corp',
          beneficiaries: [
            {
              id: 101,
              name: 'Alice Smith',
              question: 'Is primary beneficiary?',
              answer: 'yes',
              originalAnswer: 'yes'
            }
          ]
        }
      ];

      service.getCustomers().subscribe({
        next: (customers: Customer[]) => {
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

      const req = httpMock.expectOne('http://localhost:3000/api/customers');
      req.flush(mockCustomers);
    });

    it('should return customers with beneficiaries', (done) => {
      const mockCustomers: Customer[] = [
        {
          id: 1,
          name: 'Customer 1',
          email: 'customer1@example.com',
          company: 'Company 1',
          beneficiaries: [
            {
              id: 101,
              name: 'Beneficiary 1',
              question: 'Question 1',
              answer: 'yes',
              originalAnswer: 'yes'
            }
          ]
        }
      ];

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

      const req = httpMock.expectOne('http://localhost:3000/api/customers');
      req.flush(mockCustomers);
    });
  });
});
