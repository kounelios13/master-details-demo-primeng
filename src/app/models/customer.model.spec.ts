import { Customer, Beneficiary, ANSWER_OPTIONS } from './customer.model';
import { MOCK_CUSTOMERS } from '../testing/mock-data';

describe('Customer Model', () => {
  describe('Interfaces', () => {
    it('should create a valid Beneficiary object', () => {
      const beneficiary: Beneficiary = {
        id: 1,
        name: 'Test Beneficiary',
        question: 'Test Question?',
        answer: 'yes',
        originalAnswer: 'yes'
      };

      expect(beneficiary.id).toBe(1);
      expect(beneficiary.name).toBe('Test Beneficiary');
      expect(beneficiary.question).toBe('Test Question?');
      expect(beneficiary.answer).toBe('yes');
      expect(beneficiary.originalAnswer).toBe('yes');
    });

    it('should create a valid Customer object', () => {
      const customer: Customer = {
        id: 1,
        name: 'Test Customer',
        email: 'test@example.com',
        company: 'Test Company',
        beneficiaries: []
      };

      expect(customer.id).toBe(1);
      expect(customer.name).toBe('Test Customer');
      expect(customer.email).toBe('test@example.com');
      expect(customer.company).toBe('Test Company');
      expect(customer.beneficiaries).toEqual([]);
    });

    it('should create a Customer with nested Beneficiaries', () => {
      const beneficiary: Beneficiary = {
        id: 101,
        name: 'Beneficiary Name',
        question: 'Is primary?',
        answer: 'yes',
        originalAnswer: 'yes'
      };

      const customer: Customer = {
        id: 1,
        name: 'Customer Name',
        email: 'customer@example.com',
        company: 'Company Name',
        beneficiaries: [beneficiary]
      };

      expect(customer.beneficiaries.length).toBe(1);
      expect(customer.beneficiaries[0]).toEqual(beneficiary);
    });
  });

  describe('ANSWER_OPTIONS', () => {
    it('should contain 4 answer options', () => {
      expect(ANSWER_OPTIONS.length).toBe(4);
    });

    it('should have correct structure for each option', () => {
      ANSWER_OPTIONS.forEach(option => {
        expect(option.label).toBeDefined();
        expect(option.value).toBeDefined();
        expect(typeof option.label).toBe('string');
        expect(typeof option.value).toBe('string');
      });
    });

    it('should contain Yes option', () => {
      const yesOption = ANSWER_OPTIONS.find(opt => opt.value === 'yes');
      expect(yesOption).toBeDefined();
      expect(yesOption?.label).toBe('Yes');
    });

    it('should contain No option', () => {
      const noOption = ANSWER_OPTIONS.find(opt => opt.value === 'no');
      expect(noOption).toBeDefined();
      expect(noOption?.label).toBe('No');
    });

    it('should contain Maybe option', () => {
      const maybeOption = ANSWER_OPTIONS.find(opt => opt.value === 'maybe');
      expect(maybeOption).toBeDefined();
      expect(maybeOption?.label).toBe('Maybe');
    });

    it('should contain N/A option', () => {
      const naOption = ANSWER_OPTIONS.find(opt => opt.value === 'na');
      expect(naOption).toBeDefined();
      expect(naOption?.label).toBe('N/A');
    });
  });

  describe('MOCK_CUSTOMERS', () => {
    it('should contain 5 customers', () => {
      expect(MOCK_CUSTOMERS.length).toBe(5);
    });

    it('should have valid structure for all customers', () => {
      MOCK_CUSTOMERS.forEach(customer => {
        expect(customer.id).toBeDefined();
        expect(customer.name).toBeDefined();
        expect(customer.email).toBeDefined();
        expect(customer.company).toBeDefined();
        expect(customer.beneficiaries).toBeDefined();
        expect(Array.isArray(customer.beneficiaries)).toBe(true);
      });
    });

    it('should have unique customer IDs', () => {
      const ids = MOCK_CUSTOMERS.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid email addresses', () => {
      MOCK_CUSTOMERS.forEach(customer => {
        expect(customer.email).toContain('@');
        expect(customer.email).toContain('.');
      });
    });

    it('should have beneficiaries with matching answer and originalAnswer', () => {
      MOCK_CUSTOMERS.forEach(customer => {
        customer.beneficiaries.forEach(beneficiary => {
          expect(beneficiary.answer).toBe(beneficiary.originalAnswer);
        });
      });
    });

    it('should have unique beneficiary IDs across all customers', () => {
      const allBeneficiaryIds: number[] = [];
      MOCK_CUSTOMERS.forEach(customer => {
        customer.beneficiaries.forEach(beneficiary => {
          allBeneficiaryIds.push(beneficiary.id);
        });
      });
      const uniqueIds = new Set(allBeneficiaryIds);
      expect(uniqueIds.size).toBe(allBeneficiaryIds.length);
    });

    it('should have John Doe as the first customer', () => {
      expect(MOCK_CUSTOMERS[0].name).toBe('John Doe');
      expect(MOCK_CUSTOMERS[0].email).toBe('john.doe@example.com');
      expect(MOCK_CUSTOMERS[0].company).toBe('Acme Corp');
    });

    it('should have 3 beneficiaries for John Doe', () => {
      expect(MOCK_CUSTOMERS[0].beneficiaries.length).toBe(3);
    });

    it('should have at least one beneficiary for each customer', () => {
      MOCK_CUSTOMERS.forEach(customer => {
        expect(customer.beneficiaries.length).toBeGreaterThan(0);
      });
    });

    it('should have beneficiaries with valid answer values', () => {
      const validAnswers = ANSWER_OPTIONS.map(opt => opt.value);
      MOCK_CUSTOMERS.forEach(customer => {
        customer.beneficiaries.forEach(beneficiary => {
          expect(validAnswers).toContain(beneficiary.answer);
          expect(validAnswers).toContain(beneficiary.originalAnswer);
        });
      });
    });
  });
});
