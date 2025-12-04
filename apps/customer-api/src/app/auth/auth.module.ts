import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserEntity } from '../entities/user.entity';
import { ITokenStorage } from './interfaces/token-storage.interface';
import { InMemoryTokenStorage } from './token-storage/in-memory-token-storage';

export const TOKEN_STORAGE = 'ITokenStorage';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || (() => {
        console.warn('WARNING: JWT_SECRET not set! Using insecure default. Set JWT_SECRET environment variable in production.');
        return 'insecure-default-secret-change-immediately';
      })(),
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    {
      provide: TOKEN_STORAGE,
      useClass: InMemoryTokenStorage,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
