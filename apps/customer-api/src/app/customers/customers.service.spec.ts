import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersService } from './customers.service';
import { CustomerEntity } from '../entities/customer.entity';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: Repository<CustomerEntity>;

  const mockCustomer = {
    id: 1,
    name: 'Test Customer',
    email: 'test@example.com',
    company: 'Test Company',
    beneficiaries: [],
  };

  const mockRepository = {
    find: jest.fn(),
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
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<Repository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity)
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
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({
        ...mockCustomer,
        ...updateData,
      });

      const result = await service.update(1, updateData);
      expect(result).toEqual({ ...mockCustomer, ...updateData });
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      await service.delete(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
