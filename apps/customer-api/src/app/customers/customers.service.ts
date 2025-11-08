import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { Customer } from '@master-details-demo-primeng/shared-models';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
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
}
