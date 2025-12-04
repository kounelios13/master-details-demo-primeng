import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginResponse, RegisterResponse, RefreshTokenResponse } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const tokenKey = 'auth_token';
  const refreshTokenKey = 'refresh_token';
  const userIdKey = 'user_id';

  // Helper function to create a JWT token with custom payload
  function createMockJWT(payload: any): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadEncoded = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';
    return `${header}.${payloadEncoded}.${signature}`;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request to login endpoint', () => {
      const username = 'testuser';
      const password = 'testpass';
      const mockToken = createMockJWT({ sub: 1, username: 'testuser', exp: Math.floor(Date.now() / 1000) + 3600 });
      const mockResponse: LoginResponse = {
        access_token: mockToken,
        refresh_token: 'test-refresh-token',
        username: 'testuser'
      };

      service.login(username, password).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      req.flush(mockResponse);
    });

    it('should store token and refresh token in localStorage on successful login', (done) => {
      const mockToken = createMockJWT({ sub: 1, username: 'testuser', exp: Math.floor(Date.now() / 1000) + 3600 });
      const mockResponse: LoginResponse = {
        access_token: mockToken,
        refresh_token: 'my-refresh-token',
        username: 'testuser'
      };

      service.login('testuser', 'testpass').subscribe(() => {
        expect(localStorage.getItem(tokenKey)).toBe(mockToken);
        expect(localStorage.getItem(refreshTokenKey)).toBe('my-refresh-token');
        expect(localStorage.getItem(userIdKey)).toBe('1');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });

    it('should return login response', (done) => {
      const mockToken = createMockJWT({ sub: 1, username: 'testuser', exp: Math.floor(Date.now() / 1000) + 3600 });
      const mockResponse: LoginResponse = {
        access_token: mockToken,
        refresh_token: 'test-refresh-token',
        username: 'testuser'
      };

      service.login('testuser', 'testpass').subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send POST request to register endpoint', () => {
      const username = 'newuser';
      const password = 'newpass';
      const mockResponse: RegisterResponse = {
        message: 'User created successfully',
        username: 'newuser'
      };

      service.register(username, password).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      req.flush(mockResponse);
    });

    it('should return register response', (done) => {
      const mockResponse: RegisterResponse = {
        message: 'User created successfully',
        username: 'newuser'
      };

      service.register('newuser', 'newpass').subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should remove all auth tokens from localStorage', () => {
      localStorage.setItem(tokenKey, 'test-token');
      localStorage.setItem(refreshTokenKey, 'test-refresh-token');
      localStorage.setItem(userIdKey, '1');

      service.logout();

      expect(localStorage.getItem(tokenKey)).toBeNull();
      expect(localStorage.getItem(refreshTokenKey)).toBeNull();
      expect(localStorage.getItem(userIdKey)).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem(tokenKey, 'stored-token');

      const token = service.getToken();

      expect(token).toBe('stored-token');
    });

    it('should return null when no token exists', () => {
      const token = service.getToken();

      expect(token).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      service.setToken('new-token');

      expect(localStorage.getItem(tokenKey)).toBe('new-token');
    });

    it('should overwrite existing token', () => {
      localStorage.setItem(tokenKey, 'old-token');
      
      service.setToken('new-token');

      expect(localStorage.getItem(tokenKey)).toBe('new-token');
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token from localStorage', () => {
      localStorage.setItem(refreshTokenKey, 'stored-refresh-token');

      const token = service.getRefreshToken();

      expect(token).toBe('stored-refresh-token');
    });

    it('should return null when no refresh token exists', () => {
      const token = service.getRefreshToken();

      expect(token).toBeNull();
    });
  });

  describe('setRefreshToken', () => {
    it('should store refresh token in localStorage', () => {
      service.setRefreshToken('new-refresh-token');

      expect(localStorage.getItem(refreshTokenKey)).toBe('new-refresh-token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem(tokenKey, 'valid-token');

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no token exists', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true when token is expired', () => {
      const expiredToken = createMockJWT({ 
        sub: 1, 
        username: 'testuser', 
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      });
      localStorage.setItem(tokenKey, expiredToken);

      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true when token is about to expire (within 5 minutes)', () => {
      const almostExpiredToken = createMockJWT({ 
        sub: 1, 
        username: 'testuser', 
        exp: Math.floor(Date.now() / 1000) + 240 // Expires in 4 minutes
      });
      localStorage.setItem(tokenKey, almostExpiredToken);

      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return false when token is valid and not about to expire', () => {
      const validToken = createMockJWT({ 
        sub: 1, 
        username: 'testuser', 
        exp: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
      });
      localStorage.setItem(tokenKey, validToken);

      expect(service.isTokenExpired()).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', (done) => {
      const newToken = createMockJWT({ sub: 1, username: 'testuser', exp: Math.floor(Date.now() / 1000) + 3600 });
      const mockResponse: RefreshTokenResponse = {
        access_token: newToken,
        username: 'testuser'
      };

      localStorage.setItem(refreshTokenKey, 'valid-refresh-token');
      localStorage.setItem(userIdKey, '1');

      service.refreshAccessToken().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem(tokenKey)).toBe(newToken);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userId: 1, refreshToken: 'valid-refresh-token' });
      req.flush(mockResponse);
    });

    it('should throw error when no refresh token exists', (done) => {
      service.refreshAccessToken().subscribe({
        error: (error) => {
          expect(error.message).toBe('No refresh token or user ID available');
          done();
        }
      });
    });

    it('should logout on refresh token failure', (done) => {
      localStorage.setItem(refreshTokenKey, 'invalid-refresh-token');
      localStorage.setItem(userIdKey, '1');
      spyOn(service, 'logout');

      service.refreshAccessToken().subscribe({
        error: () => {
          expect(service.logout).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      req.flush({ error: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
