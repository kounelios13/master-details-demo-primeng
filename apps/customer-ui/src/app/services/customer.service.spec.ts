import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { CustomerApiService } from './api/customer-api.service';
import { AuthService } from './api/auth.service';
import { Customer, Beneficiary } from '@master-details-demo-primeng/shared-models';

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

  describe('getCustomer', () => {
    it('should return a single customer from API', (done) => {
      const mockCustomer: Customer = {
        id: 1,
        name: 'Test Customer',
        email: 'test@example.com',
        company: 'Test Corp',
        beneficiaries: []
      };

      service.getCustomer(1).subscribe((customer) => {
        expect(customer).toEqual(mockCustomer);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/customers/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomer);
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer', (done) => {
      const newCustomer: Omit<Customer, 'id'> = {
        name: 'New Customer',
        email: 'new@example.com',
        company: 'New Corp',
        beneficiaries: []
      };
      const mockResponse: Customer = { id: 1, ...newCustomer };

      service.createCustomer(newCustomer).subscribe((customer) => {
        expect(customer).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/customers');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer', (done) => {
      const updates: Partial<Customer> = { name: 'Updated Name' };
      const mockResponse: Customer = {
        id: 1,
        name: 'Updated Name',
        email: 'test@example.com',
        company: 'Test Corp',
        beneficiaries: []
      };

      service.updateCustomer(1, updates).subscribe((customer) => {
        expect(customer).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/customers/1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer', (done) => {
      service.deleteCustomer(1).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/customers/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('addBeneficiary', () => {
    it('should add a beneficiary to a customer', (done) => {
      const newBeneficiary: Omit<Beneficiary, 'id' | 'originalAnswer'> = {
        name: 'New Beneficiary',
        question: 'Test question?',
        answer: 'yes'
      };
      const mockResponse: Beneficiary = {
        id: 101,
        originalAnswer: 'yes',
        ...newBeneficiary
      };

      service.addBeneficiary(1, newBeneficiary).subscribe((beneficiary) => {
        expect(beneficiary).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/customers/1/beneficiaries');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('updateBeneficiary', () => {
    it('should update a beneficiary', (done) => {
      const updates: Partial<Beneficiary> = { answer: 'no' };
      const mockResponse: Beneficiary = {
        id: 101,
        name: 'Beneficiary',
        question: 'Test?',
        answer: 'no',
        originalAnswer: 'yes'
      };

      service.updateBeneficiary(101, updates).subscribe((beneficiary) => {
        expect(beneficiary).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/customers/beneficiaries/101');
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('deleteBeneficiary', () => {
    it('should delete a beneficiary', (done) => {
      service.deleteBeneficiary(101).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/customers/beneficiaries/101');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
