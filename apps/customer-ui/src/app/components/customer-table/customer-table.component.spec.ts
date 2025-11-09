import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormArray, FormGroup } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CustomerTableComponent } from './customer-table.component';
import { Customer, Beneficiary } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MOCK_CUSTOMERS } from '../../testing/mock-data';

describe('CustomerTableComponent', () => {
  let component: CustomerTableComponent;
  let fixture: ComponentFixture<CustomerTableComponent>;
  let customerService: jasmine.SpyObj<CustomerService>;

  beforeEach(async () => {
    const customerServiceSpy = jasmine.createSpyObj('CustomerService', [
      'getCustomers',
      'createCustomer',
      'updateCustomer',
      'deleteCustomer',
      'addBeneficiary',
      'updateBeneficiary',
      'deleteBeneficiary'
    ]);
    
    customerServiceSpy.getCustomers.and.returnValue(of(MOCK_CUSTOMERS));
    customerServiceSpy.updateBeneficiary.and.returnValue(of({} as Beneficiary));
    customerServiceSpy.createCustomer.and.returnValue(of({} as Customer));
    customerServiceSpy.deleteCustomer.and.returnValue(of(undefined));
    customerServiceSpy.addBeneficiary.and.returnValue(of({} as Beneficiary));
    customerServiceSpy.deleteBeneficiary.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [CustomerTableComponent, ReactiveFormsModule],
      providers: [
        provideAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CustomerService, useValue: customerServiceSpy }
      ]
    }).compileComponents();

    customerService = TestBed.inject(CustomerService) as jasmine.SpyObj<CustomerService>;

    fixture = TestBed.createComponent(CustomerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call customer service on init', () => {
      expect(customerService.getCustomers).toHaveBeenCalled();
    });

    it('should initialize customers from service', () => {
      expect(component.customers).toEqual(MOCK_CUSTOMERS);
    });

    it('should initialize customersForm', () => {
      expect(component.customersForm).toBeDefined();
      expect(component.customersForm.get('customers')).toBeDefined();
    });

    it('should initialize form with correct number of customers', () => {
      const customersArray = component.customersArray;
      expect(customersArray.length).toBe(MOCK_CUSTOMERS.length);
    });

    it('should initialize answerOptions', () => {
      expect(component.answerOptions).toBeDefined();
      expect(component.answerOptions.length).toBe(4);
    });

    it('should initialize expandedRows as empty object', () => {
      expect(component.expandedRows).toEqual({});
    });
  });

  describe('Form Structure', () => {
    it('should create customer form groups with correct structure', () => {
      const firstCustomer = component.getCustomerFormGroup(0);
      expect(firstCustomer.get('id')).toBeDefined();
      expect(firstCustomer.get('name')).toBeDefined();
      expect(firstCustomer.get('email')).toBeDefined();
      expect(firstCustomer.get('company')).toBeDefined();
      expect(firstCustomer.get('beneficiaries')).toBeDefined();
    });

    it('should populate customer form with correct data', () => {
      const firstCustomer = component.getCustomerFormGroup(0);
      expect(firstCustomer.get('id')?.value).toBe(MOCK_CUSTOMERS[0].id);
      expect(firstCustomer.get('name')?.value).toBe(MOCK_CUSTOMERS[0].name);
      expect(firstCustomer.get('email')?.value).toBe(MOCK_CUSTOMERS[0].email);
      expect(firstCustomer.get('company')?.value).toBe(MOCK_CUSTOMERS[0].company);
    });

    it('should create beneficiary form groups with correct structure', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      expect(beneficiary.get('id')).toBeDefined();
      expect(beneficiary.get('name')).toBeDefined();
      expect(beneficiary.get('question')).toBeDefined();
      expect(beneficiary.get('answer')).toBeDefined();
      expect(beneficiary.get('originalAnswer')).toBeDefined();
    });

    it('should populate beneficiary form with correct data', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      const mockBeneficiary = MOCK_CUSTOMERS[0].beneficiaries[0];
      expect(beneficiary.get('id')?.value).toBe(mockBeneficiary.id);
      expect(beneficiary.get('name')?.value).toBe(mockBeneficiary.name);
      expect(beneficiary.get('question')?.value).toBe(mockBeneficiary.question);
      expect(beneficiary.get('answer')?.value).toBe(mockBeneficiary.answer);
      expect(beneficiary.get('originalAnswer')?.value).toBe(mockBeneficiary.originalAnswer);
    });

    it('should create correct number of beneficiaries for each customer', () => {
      MOCK_CUSTOMERS.forEach((customer, index) => {
        const beneficiariesArray = component.getBeneficiariesArray(index);
        expect(beneficiariesArray.length).toBe(customer.beneficiaries.length);
      });
    });
  });

  describe('Form Getters', () => {
    it('should return customersArray as FormArray', () => {
      const customersArray = component.customersArray;
      expect(customersArray instanceof FormArray).toBe(true);
    });

    it('should return customer form group at correct index', () => {
      const customerGroup = component.getCustomerFormGroup(0);
      expect(customerGroup instanceof FormGroup).toBe(true);
      expect(customerGroup.get('name')?.value).toBe(MOCK_CUSTOMERS[0].name);
    });

    it('should return beneficiaries array for customer', () => {
      const beneficiariesArray = component.getBeneficiariesArray(0);
      expect(beneficiariesArray instanceof FormArray).toBe(true);
      expect(beneficiariesArray.length).toBe(MOCK_CUSTOMERS[0].beneficiaries.length);
    });

    it('should return beneficiary form group at correct indices', () => {
      const beneficiaryGroup = component.getBeneficiaryFormGroup(0, 0);
      expect(beneficiaryGroup instanceof FormGroup).toBe(true);
      expect(beneficiaryGroup.get('name')?.value).toBe(MOCK_CUSTOMERS[0].beneficiaries[0].name);
    });
  });

  describe('Change Detection', () => {
    it('should detect no changes initially', () => {
      expect(component.hasChanges(0)).toBe(false);
    });

    it('should detect changes when answer is modified', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      beneficiary.patchValue({ answer: 'no' });
      expect(component.hasChanges(0)).toBe(true);
    });

    it('should detect no changes when answer matches originalAnswer', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      const originalAnswer = beneficiary.get('originalAnswer')?.value;
      beneficiary.patchValue({ answer: originalAnswer });
      expect(component.hasChanges(0)).toBe(false);
    });

    it('should detect changes in specific beneficiary', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      expect(component.isBeneficiaryChanged(0, 0)).toBe(false);
      beneficiary.patchValue({ answer: 'no' });
      expect(component.isBeneficiaryChanged(0, 0)).toBe(true);
    });

    it('should not detect changes in unchanged beneficiaries', () => {
      const beneficiary1 = component.getBeneficiaryFormGroup(0, 0);
      const beneficiary2 = component.getBeneficiaryFormGroup(0, 1);
      beneficiary1.patchValue({ answer: 'no' });
      expect(component.isBeneficiaryChanged(0, 0)).toBe(true);
      expect(component.isBeneficiaryChanged(0, 1)).toBe(false);
    });

    it('should detect changes when any beneficiary is modified', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 1);
      beneficiary.patchValue({ answer: 'yes' });
      expect(component.hasChanges(0)).toBe(true);
    });
  });

  describe('Save Functionality', () => {
    it('should save beneficiary changes by updating originalAnswer', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      beneficiary.patchValue({ answer: 'no' });
      expect(component.isBeneficiaryChanged(0, 0)).toBe(true);
      
      component.saveBeneficiary(0, 0);
      
      expect(beneficiary.get('originalAnswer')?.value).toBe('no');
      expect(component.isBeneficiaryChanged(0, 0)).toBe(false);
    });

    it('should call updateBeneficiary API when saving', fakeAsync(() => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      beneficiary.patchValue({ answer: 'no' });
      
      component.saveBeneficiary(0, 0);
      tick();
      
      expect(customerService.updateBeneficiary).toHaveBeenCalled();
    }));

    it('should save all changes for a customer', () => {
      const beneficiary1 = component.getBeneficiaryFormGroup(0, 0);
      const beneficiary2 = component.getBeneficiaryFormGroup(0, 1);
      
      beneficiary1.patchValue({ answer: 'no' });
      beneficiary2.patchValue({ answer: 'yes' });
      
      expect(component.hasChanges(0)).toBe(true);
      
      component.saveAllChanges(0);
      
      expect(beneficiary1.get('originalAnswer')?.value).toBe('no');
      expect(beneficiary2.get('originalAnswer')?.value).toBe('yes');
      expect(component.hasChanges(0)).toBe(false);
    });

    it('should call updateBeneficiary API for each changed beneficiary when saving all', fakeAsync(() => {
      const beneficiary1 = component.getBeneficiaryFormGroup(0, 0);
      const beneficiary2 = component.getBeneficiaryFormGroup(0, 1);
      
      beneficiary1.patchValue({ answer: 'no' });
      beneficiary2.patchValue({ answer: 'yes' });
      
      component.saveAllChanges(0);
      tick();
      
      expect(customerService.updateBeneficiary).toHaveBeenCalled();
    }));

    it('should save all beneficiaries even if some are unchanged', () => {
      const beneficiary1 = component.getBeneficiaryFormGroup(0, 0);
      const originalAnswer1 = beneficiary1.get('originalAnswer')?.value;
      
      // Only change one beneficiary
      beneficiary1.patchValue({ answer: 'no' });
      
      component.saveAllChanges(0);
      
      // Changed beneficiary should be saved
      expect(beneficiary1.get('originalAnswer')?.value).toBe('no');
      
      // Unchanged beneficiaries should maintain their values
      const beneficiary2 = component.getBeneficiaryFormGroup(0, 1);
      const answer2 = beneficiary2.get('answer')?.value;
      expect(beneficiary2.get('originalAnswer')?.value).toBe(answer2);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset beneficiary changes by restoring originalAnswer', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      const originalAnswer = beneficiary.get('originalAnswer')?.value;
      
      beneficiary.patchValue({ answer: 'no' });
      expect(component.isBeneficiaryChanged(0, 0)).toBe(true);
      
      component.resetBeneficiary(0, 0);
      
      expect(beneficiary.get('answer')?.value).toBe(originalAnswer);
      expect(component.isBeneficiaryChanged(0, 0)).toBe(false);
    });

    it('should not affect other beneficiaries when resetting one', () => {
      const beneficiary1 = component.getBeneficiaryFormGroup(0, 0);
      const beneficiary2 = component.getBeneficiaryFormGroup(0, 1);
      
      beneficiary1.patchValue({ answer: 'no' });
      beneficiary2.patchValue({ answer: 'yes' });
      
      component.resetBeneficiary(0, 0);
      
      expect(component.isBeneficiaryChanged(0, 0)).toBe(false);
      expect(component.isBeneficiaryChanged(0, 1)).toBe(true);
    });

    it('should handle multiple reset operations', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      const originalAnswer = beneficiary.get('originalAnswer')?.value;
      
      beneficiary.patchValue({ answer: 'no' });
      component.resetBeneficiary(0, 0);
      
      beneficiary.patchValue({ answer: 'maybe' });
      component.resetBeneficiary(0, 0);
      
      expect(beneficiary.get('answer')?.value).toBe(originalAnswer);
    });
  });

  describe('Count Functions', () => {
    it('should return correct beneficiary count', () => {
      MOCK_CUSTOMERS.forEach((customer, index) => {
        expect(component.getBeneficiaryCount(index)).toBe(customer.beneficiaries.length);
      });
    });

    it('should return 0 changed count initially', () => {
      expect(component.getChangedCount(0)).toBe(0);
    });

    it('should return correct changed count after modifications', () => {
      const beneficiary1 = component.getBeneficiaryFormGroup(0, 0);
      const beneficiary2 = component.getBeneficiaryFormGroup(0, 1);
      
      beneficiary1.patchValue({ answer: 'no' });
      beneficiary2.patchValue({ answer: 'yes' });
      
      expect(component.getChangedCount(0)).toBe(2);
    });

    it('should return 1 when only one beneficiary is changed', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      beneficiary.patchValue({ answer: 'no' });
      
      expect(component.getChangedCount(0)).toBe(1);
    });

    it('should return 0 after saving all changes', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      beneficiary.patchValue({ answer: 'no' });
      
      component.saveAllChanges(0);
      
      expect(component.getChangedCount(0)).toBe(0);
    });

    it('should return correct count after reset', () => {
      const beneficiary1 = component.getBeneficiaryFormGroup(0, 0);
      const beneficiary2 = component.getBeneficiaryFormGroup(0, 1);
      
      beneficiary1.patchValue({ answer: 'no' });
      beneficiary2.patchValue({ answer: 'yes' });
      
      component.resetBeneficiary(0, 0);
      
      expect(component.getChangedCount(0)).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle customer with single beneficiary', () => {
      // Customer at index 3 has only 1 beneficiary
      expect(component.getBeneficiaryCount(3)).toBe(1);
      expect(component.hasChanges(3)).toBe(false);
    });

    it('should handle customer with multiple beneficiaries', () => {
      // Customer at index 2 has 4 beneficiaries
      expect(component.getBeneficiaryCount(2)).toBe(4);
    });

    it('should handle saving beneficiary with same value', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      const originalAnswer = beneficiary.get('originalAnswer')?.value;
      
      // Set answer to same value as originalAnswer
      beneficiary.patchValue({ answer: originalAnswer });
      
      component.saveBeneficiary(0, 0);
      
      expect(beneficiary.get('originalAnswer')?.value).toBe(originalAnswer);
      expect(component.isBeneficiaryChanged(0, 0)).toBe(false);
    });

    it('should handle resetting unchanged beneficiary', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      const originalAnswer = beneficiary.get('originalAnswer')?.value;
      
      component.resetBeneficiary(0, 0);
      
      expect(beneficiary.get('answer')?.value).toBe(originalAnswer);
      expect(component.isBeneficiaryChanged(0, 0)).toBe(false);
    });

    it('should maintain data integrity across multiple operations', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      const initialOriginalAnswer = beneficiary.get('originalAnswer')?.value;
      
      // Change, save, change again
      beneficiary.patchValue({ answer: 'no' });
      component.saveBeneficiary(0, 0);
      expect(beneficiary.get('originalAnswer')?.value).toBe('no');
      
      beneficiary.patchValue({ answer: 'yes' });
      expect(component.isBeneficiaryChanged(0, 0)).toBe(true);
      
      component.resetBeneficiary(0, 0);
      expect(beneficiary.get('answer')?.value).toBe('no');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex workflow: change, save, change, reset', () => {
      const beneficiary = component.getBeneficiaryFormGroup(0, 0);
      
      // Initial state
      expect(component.isBeneficiaryChanged(0, 0)).toBe(false);
      
      // Change
      beneficiary.patchValue({ answer: 'no' });
      expect(component.isBeneficiaryChanged(0, 0)).toBe(true);
      
      // Save
      component.saveBeneficiary(0, 0);
      expect(component.isBeneficiaryChanged(0, 0)).toBe(false);
      
      // Change again
      beneficiary.patchValue({ answer: 'yes' });
      expect(component.isBeneficiaryChanged(0, 0)).toBe(true);
      
      // Reset
      component.resetBeneficiary(0, 0);
      expect(beneficiary.get('answer')?.value).toBe('no');
      expect(component.isBeneficiaryChanged(0, 0)).toBe(false);
    });

    it('should handle multiple beneficiaries with different states', () => {
      const beneficiary1 = component.getBeneficiaryFormGroup(0, 0);
      const beneficiary2 = component.getBeneficiaryFormGroup(0, 1);
      const beneficiary3 = component.getBeneficiaryFormGroup(0, 2);
      
      // Change beneficiary 1 and 2
      beneficiary1.patchValue({ answer: 'no' });
      beneficiary2.patchValue({ answer: 'yes' });
      
      expect(component.getChangedCount(0)).toBe(2);
      
      // Save beneficiary 1
      component.saveBeneficiary(0, 0);
      expect(component.getChangedCount(0)).toBe(1);
      
      // Reset beneficiary 2
      component.resetBeneficiary(0, 1);
      expect(component.getChangedCount(0)).toBe(0);
      
      // Beneficiary 3 should remain unchanged throughout
      expect(component.isBeneficiaryChanged(0, 2)).toBe(false);
    });

    it('should properly count changes across all customers independently', () => {
      // Modify customer 0
      const ben1 = component.getBeneficiaryFormGroup(0, 0);
      ben1.patchValue({ answer: 'no' });
      
      // Modify customer 1
      const ben2 = component.getBeneficiaryFormGroup(1, 0);
      ben2.patchValue({ answer: 'yes' });
      
      expect(component.getChangedCount(0)).toBe(1);
      expect(component.getChangedCount(1)).toBe(1);
      
      // Save all for customer 0
      component.saveAllChanges(0);
      
      expect(component.getChangedCount(0)).toBe(0);
      expect(component.getChangedCount(1)).toBe(1);
    });
  });
});
