import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginResponse, RegisterResponse } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const tokenKey = 'auth_token';

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
      const mockResponse: LoginResponse = {
        access_token: 'test-token',
        username: 'testuser'
      };

      service.login(username, password).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      req.flush(mockResponse);
    });

    it('should store token in localStorage on successful login', (done) => {
      const mockResponse: LoginResponse = {
        access_token: 'my-token',
        username: 'testuser'
      };

      service.login('testuser', 'testpass').subscribe(() => {
        expect(localStorage.getItem(tokenKey)).toBe('my-token');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });

    it('should return login response', (done) => {
      const mockResponse: LoginResponse = {
        access_token: 'test-token',
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
    it('should remove token from localStorage', () => {
      localStorage.setItem(tokenKey, 'test-token');
      expect(localStorage.getItem(tokenKey)).toBe('test-token');

      service.logout();

      expect(localStorage.getItem(tokenKey)).toBeNull();
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

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem(tokenKey, 'valid-token');

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
