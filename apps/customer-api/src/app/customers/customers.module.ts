import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerEntity } from '../entities/customer.entity';
import { BeneficiaryEntity } from '../entities/beneficiary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity, BeneficiaryEntity])],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
