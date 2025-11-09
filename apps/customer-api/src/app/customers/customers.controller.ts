import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Customer, Beneficiary } from '@master-details-demo-primeng/shared-models';

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

  @Post(':id/beneficiaries')
  addBeneficiary(
    @Param('id') id: string,
    @Body() beneficiary: Omit<Beneficiary, 'id'>,
  ): Promise<Beneficiary> {
    return this.customersService.addBeneficiary(+id, beneficiary);
  }

  @Put('beneficiaries/:beneficiaryId')
  updateBeneficiary(
    @Param('beneficiaryId') beneficiaryId: string,
    @Body() beneficiary: Partial<Beneficiary>,
  ): Promise<Beneficiary | null> {
    return this.customersService.updateBeneficiary(+beneficiaryId, beneficiary);
  }

  @Delete('beneficiaries/:beneficiaryId')
  deleteBeneficiary(@Param('beneficiaryId') beneficiaryId: string): Promise<void> {
    return this.customersService.deleteBeneficiary(+beneficiaryId);
  }
}
