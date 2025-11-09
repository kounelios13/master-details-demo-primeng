import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from '../seed/seed.service';

// Load environment variables from .env file
dotenv.config({ path: resolve(process.cwd(), 'apps/customer-api/.env') });

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  
  console.log('Starting database initialization...');
  await seedService.seedDatabase();
  console.log('Database initialization completed.');
  
  await app.close();
}

bootstrap().catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});
