import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { CustomerEntity } from '../entities/customer.entity';
import { BeneficiaryEntity } from '../entities/beneficiary.entity';
import { UserEntity } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity, BeneficiaryEntity, UserEntity])],
  providers: [SeedService],
})
export class SeedModule {}
