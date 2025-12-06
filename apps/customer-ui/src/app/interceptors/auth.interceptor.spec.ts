import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/api/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getToken', 
      'getRefreshToken', 
      'isTokenExpired',
      'refreshAccessToken',
      'logout'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should not add token to auth/login requests', (done) => {
    const mockRequest = new HttpRequest('POST', '/auth/login', {});
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));
    authService.getToken.and.returnValue('test-token');

    interceptor(mockRequest, next).subscribe(() => {
      expect(next).toHaveBeenCalledWith(mockRequest);
      done();
    });
  });

  it('should not add token to auth/register requests', (done) => {
    const mockRequest = new HttpRequest('POST', '/auth/register', {});
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));
    authService.getToken.and.returnValue('test-token');

    interceptor(mockRequest, next).subscribe(() => {
      expect(next).toHaveBeenCalledWith(mockRequest);
      done();
    });
  });

  it('should not add token to auth/refresh requests', (done) => {
    const mockRequest = new HttpRequest('POST', '/auth/refresh', {});
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));
    authService.getToken.and.returnValue('test-token');

    interceptor(mockRequest, next).subscribe(() => {
      expect(next).toHaveBeenCalledWith(mockRequest);
      done();
    });
  });

  it('should add token to non-auth requests when token exists and not expired', (done) => {
    const mockRequest = new HttpRequest('GET', '/api/customers');
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));
    authService.getToken.and.returnValue('test-token');
    authService.isTokenExpired.and.returnValue(false);

    interceptor(mockRequest, next).subscribe(() => {
      const modifiedRequest = next.calls.mostRecent().args[0];
      expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer test-token');
      done();
    });
  });

  it('should not add token when token does not exist', (done) => {
    const mockRequest = new HttpRequest('GET', '/api/customers');
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));
    authService.getToken.and.returnValue(null);
    authService.isTokenExpired.and.returnValue(true);
    authService.getRefreshToken.and.returnValue(null);

    interceptor(mockRequest, next).subscribe(() => {
      expect(next).toHaveBeenCalledWith(mockRequest);
      const modifiedRequest = next.calls.mostRecent().args[0];
      expect(modifiedRequest.headers.has('Authorization')).toBe(false);
      done();
    });
  });

  it('should clone request with authorization header', (done) => {
    const mockRequest = new HttpRequest('POST', '/api/customers', { name: 'Test' });
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));
    authService.getToken.and.returnValue('my-token-123');
    authService.isTokenExpired.and.returnValue(false);

    interceptor(mockRequest, next).subscribe(() => {
      const modifiedRequest = next.calls.mostRecent().args[0];
      expect(modifiedRequest).not.toBe(mockRequest);
      expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer my-token-123');
      done();
    });
  });
});
