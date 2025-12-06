import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserEntity } from '../entities/user.entity';
import { ITokenStorage } from './interfaces/token-storage.interface';
import { TOKEN_STORAGE } from './auth.constants';

@Injectable()
export class AuthService {
  // Refresh token expiration in days
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    @Inject(TOKEN_STORAGE)
    private tokenStorage: ITokenStorage,
  ) {}

  async register(username: string, password: string) {
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return {
      message: 'User registered successfully',
      username: user.username,
    };
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      username: user.username,
    };
  }

  async validateUser(userId: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * Generate a new refresh token for a user
   */
  private async generateRefreshToken(userId: number): Promise<string> {
    const refreshToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    await this.tokenStorage.store(userId, refreshToken, expiresAt);
    return refreshToken;
  }

  /**
   * Refresh access token using a refresh token
   */
  async refreshAccessToken(userId: number, refreshToken: string) {
    // Verify the refresh token exists in storage and is valid
    const isValid = await this.tokenStorage.verify(userId, refreshToken);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Get the user
    const user = await this.validateUser(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      username: user.username,
    };
  }

  /**
   * Revoke a refresh token (logout)
   */
  async revokeRefreshToken(userId: number): Promise<void> {
    await this.tokenStorage.delete(userId);
  }
}
