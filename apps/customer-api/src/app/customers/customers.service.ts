import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { BeneficiaryEntity } from '../entities/beneficiary.entity';
import { Customer, Beneficiary } from '@master-details-demo-primeng/shared-models';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(BeneficiaryEntity)
    private beneficiaryRepository: Repository<BeneficiaryEntity>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({ relations: ['beneficiaries'] });
  }

  async findOne(id: number): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: { id },
      relations: ['beneficiaries'],
    });
  }

  async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const newCustomer = this.customerRepository.create(customer);
    return this.customerRepository.save(newCustomer);
  }

  async update(id: number, customer: Partial<Customer>): Promise<Customer | null> {
    await this.customerRepository.update(id, customer as any);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async addBeneficiary(customerId: number, beneficiary: Omit<Beneficiary, 'id'>): Promise<Beneficiary> {
    const customer = await this.findOne(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    const newBeneficiary = this.beneficiaryRepository.create({
      ...beneficiary,
      customerId,
    });
    return this.beneficiaryRepository.save(newBeneficiary);
  }

  async updateBeneficiary(beneficiaryId: number, beneficiary: Partial<Beneficiary>): Promise<Beneficiary | null> {
    await this.beneficiaryRepository.update(beneficiaryId, beneficiary as any);
    return this.beneficiaryRepository.findOne({ where: { id: beneficiaryId } });
  }

  async deleteBeneficiary(beneficiaryId: number): Promise<void> {
    await this.beneficiaryRepository.delete(beneficiaryId);
  }
}
