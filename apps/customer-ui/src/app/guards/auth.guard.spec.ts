import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/api/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should return true when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBe(true);
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

  it('should return UrlTree to /login when user is not authenticated', () => {
    const mockUrlTree = {} as UrlTree;
    authService.isAuthenticated.and.returnValue(false);
    router.parseUrl.and.returnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBe(mockUrlTree);
    expect(authService.isAuthenticated).toHaveBeenCalled();
    expect(router.parseUrl).toHaveBeenCalledWith('/login');
  });
});
