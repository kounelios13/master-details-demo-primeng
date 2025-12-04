import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserEntity } from '../entities/user.entity';
import { ITokenStorage } from './interfaces/token-storage.interface';
import { TOKEN_STORAGE } from './auth.module';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<UserEntity>;
  let jwtService: JwtService;
  let tokenStorage: ITokenStorage;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockTokenStorage = {
    store: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    verify: jest.fn(),
    cleanupExpired: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TOKEN_STORAGE,
          useValue: mockTokenStorage,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity)
    );
    jwtService = module.get<JwtService>(JwtService);
    tokenStorage = module.get<ITokenStorage>(TOKEN_STORAGE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.register('testuser', 'password123');

      expect(result).toEqual({
        message: 'User registered successfully',
        username: 'testuser',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw error if username exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register('testuser', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should login a user and return access token and refresh token', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');
      mockTokenStorage.store.mockResolvedValue(undefined);

      const result = await service.login('testuser', 'password123');

      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('username', 'testuser');
      expect(typeof result.refresh_token).toBe('string');
      expect(result.refresh_token.length).toBeGreaterThan(0);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword'
      );
      expect(tokenStorage.store).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login('testuser', 'password123')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw error if password is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.validateUser(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await service.validateUser(999);
      expect(result).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      mockTokenStorage.verify.mockResolvedValue(true);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.refreshAccessToken(1, 'valid-refresh-token');

      expect(result).toEqual({
        access_token: 'new-jwt-token',
        username: 'testuser',
      });
      expect(tokenStorage.verify).toHaveBeenCalledWith(1, 'valid-refresh-token');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw error if refresh token is invalid', async () => {
      mockTokenStorage.verify.mockResolvedValue(false);

      await expect(
        service.refreshAccessToken(1, 'invalid-token')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if user not found', async () => {
      mockTokenStorage.verify.mockResolvedValue(true);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.refreshAccessToken(1, 'valid-token')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke refresh token', async () => {
      mockTokenStorage.delete.mockResolvedValue(undefined);

      await service.revokeRefreshToken(1);

      expect(tokenStorage.delete).toHaveBeenCalledWith(1);
    });
  });
});
