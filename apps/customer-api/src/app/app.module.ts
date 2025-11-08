import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { SeedModule } from './seed/seed.module';
import { CustomerEntity } from './entities/customer.entity';
import { BeneficiaryEntity } from './entities/beneficiary.entity';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      entities: [CustomerEntity, BeneficiaryEntity, UserEntity],
      synchronize: true,
    }),
    AuthModule,
    CustomersModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
