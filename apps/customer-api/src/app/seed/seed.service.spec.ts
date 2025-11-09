import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SeedService } from './seed.service';
import { CustomerEntity } from '../entities/customer.entity';
import { BeneficiaryEntity } from '../entities/beneficiary.entity';
import { UserEntity } from '../entities/user.entity';

jest.mock('bcrypt');

describe('SeedService', () => {
  let service: SeedService;
  let customerRepository: Repository<CustomerEntity>;
  let beneficiaryRepository: Repository<BeneficiaryEntity>;
  let userRepository: Repository<UserEntity>;

  const mockCustomerRepository = {
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockBeneficiaryRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(CustomerEntity),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(BeneficiaryEntity),
          useValue: mockBeneficiaryRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    customerRepository = module.get<Repository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity)
    );
    beneficiaryRepository = module.get<Repository<BeneficiaryEntity>>(
      getRepositoryToken(BeneficiaryEntity)
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Clean up environment variables after each test
    delete process.env['SEED_USERNAME'];
    delete process.env['SEED_PASSWORD'];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDatabase', () => {
    it('should skip seeding if database already has data', async () => {
      mockCustomerRepository.count.mockResolvedValue(5);

      await service.seedDatabase();

      expect(customerRepository.count).toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(customerRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if SEED_USERNAME is not provided', async () => {
      mockCustomerRepository.count.mockResolvedValue(0);
      delete process.env['SEED_USERNAME'];
      delete process.env['SEED_PASSWORD'];

      await expect(service.seedDatabase()).rejects.toThrow(
        'SEED_USERNAME and SEED_PASSWORD environment variables must be set for database seeding'
      );
    });

    it('should throw error if SEED_PASSWORD is not provided', async () => {
      mockCustomerRepository.count.mockResolvedValue(0);
      process.env['SEED_USERNAME'] = 'testuser';
      delete process.env['SEED_PASSWORD'];

      await expect(service.seedDatabase()).rejects.toThrow(
        'SEED_USERNAME and SEED_PASSWORD environment variables must be set for database seeding'
      );
    });

    it('should throw error if SEED_USERNAME is empty string', async () => {
      mockCustomerRepository.count.mockResolvedValue(0);
      process.env['SEED_USERNAME'] = '';
      process.env['SEED_PASSWORD'] = 'testpass';

      await expect(service.seedDatabase()).rejects.toThrow(
        'SEED_USERNAME and SEED_PASSWORD environment variables must be set for database seeding'
      );
    });

    it('should throw error if SEED_PASSWORD is empty string', async () => {
      mockCustomerRepository.count.mockResolvedValue(0);
      process.env['SEED_USERNAME'] = 'testuser';
      process.env['SEED_PASSWORD'] = '';

      await expect(service.seedDatabase()).rejects.toThrow(
        'SEED_USERNAME and SEED_PASSWORD environment variables must be set for database seeding'
      );
    });

    it('should seed database when environment variables are provided', async () => {
      mockCustomerRepository.count.mockResolvedValue(0);
      process.env['SEED_USERNAME'] = 'testuser';
      process.env['SEED_PASSWORD'] = 'testpass123';

      const mockUser = { id: 1, username: 'testuser', password: 'hashedpass' };
      const mockCustomer = { id: 1, name: 'John Doe', email: 'john@example.com', company: 'Acme Corp' };
      const mockBeneficiary = { id: 1, name: 'Alice Smith', customerId: 1 };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);
      mockBeneficiaryRepository.create.mockReturnValue(mockBeneficiary);
      mockBeneficiaryRepository.save.mockResolvedValue(mockBeneficiary);

      await service.seedDatabase();

      expect(bcrypt.hash).toHaveBeenCalledWith('testpass123', 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'hashedpass',
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(customerRepository.create).toHaveBeenCalled();
      expect(customerRepository.save).toHaveBeenCalled();
      expect(beneficiaryRepository.create).toHaveBeenCalled();
      expect(beneficiaryRepository.save).toHaveBeenCalled();
    });
  });
});
