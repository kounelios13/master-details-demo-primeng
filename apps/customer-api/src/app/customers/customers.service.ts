import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { BeneficiaryEntity } from '../entities/beneficiary.entity';
import { Customer, Beneficiary } from '@master-details-demo-primeng/shared-models';
import { CreateCustomerDto, UpdateCustomerDto, CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto';

/**
 * Service handling business logic for customer and beneficiary operations
 */
@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(BeneficiaryEntity)
    private beneficiaryRepository: Repository<BeneficiaryEntity>,
  ) {}

  /**
   * Retrieve all customers with their beneficiaries
   */
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({ relations: ['beneficiaries'] });
  }

  /**
   * Retrieve a single customer by ID with beneficiaries
   * @throws NotFoundException if customer is not found
   */
  async findOne(id: number): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: { id },
      relations: ['beneficiaries'],
    });
  }

  /**
   * Create a new customer
   */
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const newCustomer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(newCustomer);
  }

  /**
   * Update an existing customer
   * @throws NotFoundException if customer is not found
   */
  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer | null> {
    const customer = await this.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    
    await this.customerRepository.update(id, updateCustomerDto as Partial<CustomerEntity>);
    return this.findOne(id);
  }

  /**
   * Delete a customer and all associated beneficiaries
   * @throws NotFoundException if customer is not found
   */
  async delete(id: number): Promise<void> {
    const customer = await this.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    
    await this.customerRepository.delete(id);
  }

  /**
   * Add a beneficiary to an existing customer
   * @throws NotFoundException if customer is not found
   */
  async addBeneficiary(customerId: number, createBeneficiaryDto: CreateBeneficiaryDto): Promise<Beneficiary> {
    const customer = await this.findOne(customerId);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }
    
    const newBeneficiary = this.beneficiaryRepository.create({
      ...createBeneficiaryDto,
      customerId,
    });
    return this.beneficiaryRepository.save(newBeneficiary);
  }

  /**
   * Update an existing beneficiary
   * @throws NotFoundException if beneficiary is not found
   */
  async updateBeneficiary(beneficiaryId: number, updateBeneficiaryDto: UpdateBeneficiaryDto): Promise<Beneficiary | null> {
    const beneficiary = await this.beneficiaryRepository.findOne({ where: { id: beneficiaryId } });
    if (!beneficiary) {
      throw new NotFoundException(`Beneficiary with ID ${beneficiaryId} not found`);
    }
    
    await this.beneficiaryRepository.update(beneficiaryId, updateBeneficiaryDto as Partial<BeneficiaryEntity>);
    return this.beneficiaryRepository.findOne({ where: { id: beneficiaryId } });
  }

  /**
   * Delete a beneficiary
   * @throws NotFoundException if beneficiary is not found
   */
  async deleteBeneficiary(beneficiaryId: number): Promise<void> {
    const beneficiary = await this.beneficiaryRepository.findOne({ where: { id: beneficiaryId } });
    if (!beneficiary) {
      throw new NotFoundException(`Beneficiary with ID ${beneficiaryId} not found`);
    }
    
    await this.beneficiaryRepository.delete(beneficiaryId);
  }
}
