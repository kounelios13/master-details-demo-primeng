import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Customer } from '@master-details-demo-primeng/shared-models';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Customer | null> {
    return this.customersService.findOne(+id);
  }

  @Post()
  create(@Body() customer: Omit<Customer, 'id'>): Promise<Customer> {
    return this.customersService.create(customer);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() customer: Partial<Customer>,
  ): Promise<Customer | null> {
    return this.customersService.update(+id, customer);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.customersService.delete(+id);
  }
}
