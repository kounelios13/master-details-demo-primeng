import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CustomerApiService } from './customer-api.service';
import { Customer, Beneficiary } from '@master-details-demo-primeng/shared-models';
import { environment } from '../../../environments/environment';

describe('CustomerApiService', () => {
  let service: CustomerApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CustomerApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CustomerApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCustomers', () => {
    it('should send GET request to customers endpoint', () => {
      const mockCustomers: Customer[] = [];

      service.getCustomers().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/customers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomers);
    });

    it('should return customers array', (done) => {
      const mockCustomers: Customer[] = [
        {
          id: 1,
          name: 'Test Customer',
          email: 'test@example.com',
          company: 'Test Corp',
          beneficiaries: []
        }
      ];

      service.getCustomers().subscribe((customers) => {
        expect(customers).toEqual(mockCustomers);
        expect(customers.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/customers`);
      req.flush(mockCustomers);
    });
  });

  describe('getCustomer', () => {
    it('should send GET request to specific customer endpoint', () => {
      const customerId = 1;
      const mockCustomer: Customer = {
        id: 1,
        name: 'Test Customer',
        email: 'test@example.com',
        company: 'Test Corp',
        beneficiaries: []
      };

      service.getCustomer(customerId).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomer);
    });

    it('should return single customer', (done) => {
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

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/1`);
      req.flush(mockCustomer);
    });
  });

  describe('createCustomer', () => {
    it('should send POST request to customers endpoint', () => {
      const newCustomer: Omit<Customer, 'id'> = {
        name: 'New Customer',
        email: 'new@example.com',
        company: 'New Corp',
        beneficiaries: []
      };
      const mockResponse: Customer = { id: 1, ...newCustomer };

      service.createCustomer(newCustomer).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/customers`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCustomer);
      req.flush(mockResponse);
    });

    it('should return created customer with id', (done) => {
      const newCustomer: Omit<Customer, 'id'> = {
        name: 'New Customer',
        email: 'new@example.com',
        company: 'New Corp',
        beneficiaries: []
      };
      const mockResponse: Customer = { id: 1, ...newCustomer };

      service.createCustomer(newCustomer).subscribe((customer) => {
        expect(customer).toEqual(mockResponse);
        expect(customer.id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/customers`);
      req.flush(mockResponse);
    });
  });

  describe('updateCustomer', () => {
    it('should send PUT request to specific customer endpoint', () => {
      const customerId = 1;
      const updates: Partial<Customer> = { name: 'Updated Name' };
      const mockResponse: Customer = {
        id: 1,
        name: 'Updated Name',
        email: 'test@example.com',
        company: 'Test Corp',
        beneficiaries: []
      };

      service.updateCustomer(customerId, updates).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });

    it('should return updated customer', (done) => {
      const mockResponse: Customer = {
        id: 1,
        name: 'Updated Name',
        email: 'test@example.com',
        company: 'Test Corp',
        beneficiaries: []
      };

      service.updateCustomer(1, { name: 'Updated Name' }).subscribe((customer) => {
        expect(customer).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/1`);
      req.flush(mockResponse);
    });
  });

  describe('deleteCustomer', () => {
    it('should send DELETE request to specific customer endpoint', () => {
      const customerId = 1;

      service.deleteCustomer(customerId).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('addBeneficiary', () => {
    it('should send POST request to customer beneficiaries endpoint', () => {
      const customerId = 1;
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

      service.addBeneficiary(customerId, newBeneficiary).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/beneficiaries`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newBeneficiary);
      req.flush(mockResponse);
    });

    it('should return created beneficiary with id', (done) => {
      const customerId = 1;
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

      service.addBeneficiary(customerId, newBeneficiary).subscribe((beneficiary) => {
        expect(beneficiary).toEqual(mockResponse);
        expect(beneficiary.id).toBe(101);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/beneficiaries`);
      req.flush(mockResponse);
    });
  });

  describe('updateBeneficiary', () => {
    it('should send PUT request to beneficiary endpoint', () => {
      const beneficiaryId = 101;
      const updates: Partial<Beneficiary> = { answer: 'no' };
      const mockResponse: Beneficiary = {
        id: 101,
        name: 'Beneficiary',
        question: 'Test?',
        answer: 'no',
        originalAnswer: 'yes'
      };

      service.updateBeneficiary(beneficiaryId, updates).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/beneficiaries/${beneficiaryId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });

    it('should return updated beneficiary', (done) => {
      const mockResponse: Beneficiary = {
        id: 101,
        name: 'Beneficiary',
        question: 'Test?',
        answer: 'no',
        originalAnswer: 'yes'
      };

      service.updateBeneficiary(101, { answer: 'no' }).subscribe((beneficiary) => {
        expect(beneficiary).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/beneficiaries/101`);
      req.flush(mockResponse);
    });
  });

  describe('deleteBeneficiary', () => {
    it('should send DELETE request to beneficiary endpoint', () => {
      const beneficiaryId = 101;

      service.deleteBeneficiary(beneficiaryId).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/beneficiaries/${beneficiaryId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
