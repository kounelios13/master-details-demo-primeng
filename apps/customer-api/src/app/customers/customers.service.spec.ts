import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersService } from './customers.service';
import { CustomerEntity } from '../entities/customer.entity';
import { BeneficiaryEntity } from '../entities/beneficiary.entity';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: Repository<CustomerEntity>;
  let beneficiaryRepository: Repository<BeneficiaryEntity>;

  const mockCustomer = {
    id: 1,
    name: 'Test Customer',
    email: 'test@example.com',
    company: 'Test Company',
    beneficiaries: [],
  };

  const mockBeneficiary = {
    id: 1,
    name: 'Test Beneficiary',
    question: 'Test Question',
    answer: 'yes',
    originalAnswer: 'yes',
    customerId: 1,
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockBeneficiaryRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(CustomerEntity),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(BeneficiaryEntity),
          useValue: mockBeneficiaryRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<Repository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity)
    );
    beneficiaryRepository = module.get<Repository<BeneficiaryEntity>>(
      getRepositoryToken(BeneficiaryEntity)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      mockRepository.find.mockResolvedValue([mockCustomer]);
      const result = await service.findAll();
      expect(result).toEqual([mockCustomer]);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['beneficiaries'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single customer', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      const result = await service.findOne(1);
      expect(result).toEqual(mockCustomer);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['beneficiaries'],
      });
    });
  });

  describe('create', () => {
    it('should create and return a customer', async () => {
      const newCustomer = { ...mockCustomer };
      delete (newCustomer as any).id;

      mockRepository.create.mockReturnValue(mockCustomer);
      mockRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.create(newCustomer);
      expect(result).toEqual(mockCustomer);
      expect(repository.create).toHaveBeenCalledWith(newCustomer);
      expect(repository.save).toHaveBeenCalledWith(mockCustomer);
    });
  });

  describe('update', () => {
    it('should update and return a customer', async () => {
      const updateData = { name: 'Updated Name' };
      mockRepository.findOne.mockResolvedValueOnce(mockCustomer);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce({
        ...mockCustomer,
        ...updateData,
      });

      const result = await service.update(1, updateData);
      expect(result).toEqual({ ...mockCustomer, ...updateData });
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw error if customer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, { name: 'Test' })).rejects.toThrow('Customer with ID 999 not found');
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      await service.delete(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error if customer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow('Customer with ID 999 not found');
    });
  });

  describe('addBeneficiary', () => {
    it('should add a beneficiary to a customer with originalAnswer set automatically', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      // Create DTO without originalAnswer (as per CreateBeneficiaryDto)
      const createBeneficiaryDto = {
        name: 'Test Beneficiary',
        question: 'Test Question',
        answer: 'yes',
      };
      
      mockBeneficiaryRepository.create.mockReturnValue(mockBeneficiary);
      mockBeneficiaryRepository.save.mockResolvedValue(mockBeneficiary);

      const result = await service.addBeneficiary(1, createBeneficiaryDto);
      expect(result).toEqual(mockBeneficiary);
      // Verify originalAnswer is set automatically to match answer
      expect(beneficiaryRepository.create).toHaveBeenCalledWith({
        ...createBeneficiaryDto,
        customerId: 1,
        originalAnswer: 'yes',
      });
      expect(beneficiaryRepository.save).toHaveBeenCalledWith(mockBeneficiary);
    });

    it('should throw error if customer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.addBeneficiary(999, mockBeneficiary)).rejects.toThrow('Customer with ID 999 not found');
    });
  });

  describe('updateBeneficiary', () => {
    it('should update and return a beneficiary', async () => {
      const updateData = { answer: 'no' };
      mockBeneficiaryRepository.findOne.mockResolvedValueOnce(mockBeneficiary);
      mockBeneficiaryRepository.update.mockResolvedValue({ affected: 1 });
      mockBeneficiaryRepository.findOne.mockResolvedValueOnce({
        ...mockBeneficiary,
        ...updateData,
      });

      const result = await service.updateBeneficiary(1, updateData);
      expect(result).toEqual({ ...mockBeneficiary, ...updateData });
      expect(beneficiaryRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw error if beneficiary not found', async () => {
      mockBeneficiaryRepository.findOne.mockResolvedValue(null);
      await expect(service.updateBeneficiary(999, { answer: 'no' })).rejects.toThrow('Beneficiary with ID 999 not found');
    });
  });

  describe('deleteBeneficiary', () => {
    it('should delete a beneficiary', async () => {
      mockBeneficiaryRepository.findOne.mockResolvedValue(mockBeneficiary);
      mockBeneficiaryRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deleteBeneficiary(1);
      expect(beneficiaryRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error if beneficiary not found', async () => {
      mockBeneficiaryRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteBeneficiary(999)).rejects.toThrow('Beneficiary with ID 999 not found');
    });
  });
});
