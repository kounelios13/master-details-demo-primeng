import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { BeneficiaryEntity } from '../entities/beneficiary.entity';
import { UserEntity } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(BeneficiaryEntity)
    private beneficiaryRepository: Repository<BeneficiaryEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async seedDatabase() {
    // Check if database is already seeded
    const customerCount = await this.customerRepository.count();
    if (customerCount > 0) {
      this.logger.log('Database already seeded');
      return;
    }

    this.logger.log('Seeding database...');

    // Get credentials from environment variables or use defaults (for development only)
    const defaultUsername = process.env['SEED_USERNAME'] || 'demo';
    const defaultPassword = process.env['SEED_PASSWORD'] || 'demo123';

    // Create default user
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const user = this.userRepository.create({
      username: defaultUsername,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    this.logger.log(`Created user: ${defaultUsername}`);

    // Seed customers
    const customers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corp',
        beneficiaries: [
          {
            name: 'Alice Smith',
            question: 'Is primary beneficiary?',
            answer: 'yes',
            originalAnswer: 'yes',
          },
          {
            name: 'Bob Johnson',
            question: 'Receives notifications?',
            answer: 'no',
            originalAnswer: 'no',
          },
          {
            name: 'Carol Williams',
            question: 'Has access rights?',
            answer: 'maybe',
            originalAnswer: 'maybe',
          },
        ],
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        company: 'Tech Solutions Inc',
        beneficiaries: [
          {
            name: 'David Brown',
            question: 'Is primary beneficiary?',
            answer: 'no',
            originalAnswer: 'no',
          },
          {
            name: 'Emma Davis',
            question: 'Receives notifications?',
            answer: 'yes',
            originalAnswer: 'yes',
          },
        ],
      },
      {
        name: 'Michael Johnson',
        email: 'michael.j@example.com',
        company: 'Global Enterprises',
        beneficiaries: [
          {
            name: 'Frank Miller',
            question: 'Is primary beneficiary?',
            answer: 'yes',
            originalAnswer: 'yes',
          },
          {
            name: 'Grace Wilson',
            question: 'Receives notifications?',
            answer: 'yes',
            originalAnswer: 'yes',
          },
          {
            name: 'Henry Moore',
            question: 'Has access rights?',
            answer: 'na',
            originalAnswer: 'na',
          },
          {
            name: 'Iris Taylor',
            question: 'Receives notifications?',
            answer: 'maybe',
            originalAnswer: 'maybe',
          },
        ],
      },
      {
        name: 'Sarah Davis',
        email: 'sarah.davis@example.com',
        company: 'Innovation Labs',
        beneficiaries: [
          {
            name: 'Jack Anderson',
            question: 'Is primary beneficiary?',
            answer: 'no',
            originalAnswer: 'no',
          },
        ],
      },
      {
        name: 'Robert Martinez',
        email: 'robert.m@example.com',
        company: 'Digital Dynamics',
        beneficiaries: [
          {
            name: 'Karen Thomas',
            question: 'Is primary beneficiary?',
            answer: 'yes',
            originalAnswer: 'yes',
          },
          {
            name: 'Larry Jackson',
            question: 'Receives notifications?',
            answer: 'no',
            originalAnswer: 'no',
          },
          {
            name: 'Maria White',
            question: 'Has access rights?',
            answer: 'yes',
            originalAnswer: 'yes',
          },
        ],
      },
    ];

    for (const customerData of customers) {
      const customer = this.customerRepository.create({
        name: customerData.name,
        email: customerData.email,
        company: customerData.company,
      });
      const savedCustomer = await this.customerRepository.save(customer);

      for (const beneficiaryData of customerData.beneficiaries) {
        const beneficiary = this.beneficiaryRepository.create({
          ...beneficiaryData,
          customerId: savedCustomer.id,
        });
        await this.beneficiaryRepository.save(beneficiary);
      }
    }

    this.logger.log('Database seeding completed');
  }
}
