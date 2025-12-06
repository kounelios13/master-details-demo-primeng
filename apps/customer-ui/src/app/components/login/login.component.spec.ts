import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/api/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    authService.isAuthenticated.and.returnValue(false);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should redirect to customers if already authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    expect(router.navigate).toHaveBeenCalledWith(['/customers']);
  });

  it('should not redirect if not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    expect(router.navigate).not.toHaveBeenCalled();
  });

  describe('login', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(false);
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should call authService.login with username and password', () => {
      component.username = 'testuser';
      component.password = 'testpass';
      authService.login.and.returnValue(of({ access_token: 'token', refresh_token: 'refresh-token', username: 'testuser' }));

      component.login();

      expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass');
    });

    it('should navigate to customers on successful login', () => {
      component.username = 'testuser';
      component.password = 'testpass';
      authService.login.and.returnValue(of({ access_token: 'token', refresh_token: 'refresh-token', username: 'testuser' }));

      component.login();

      expect(router.navigate).toHaveBeenCalledWith(['/customers']);
    });

    it('should clear error message before login', () => {
      component.errorMessage = 'Previous error';
      component.username = 'testuser';
      component.password = 'testpass';
      authService.login.and.returnValue(of({ access_token: 'token', refresh_token: 'refresh-token', username: 'testuser' }));

      component.login();

      expect(component.errorMessage).toBe('');
    });

    it('should set error message on login failure', () => {
      component.username = 'testuser';
      component.password = 'wrongpass';
      const errorResponse = { error: { message: 'Invalid credentials' } };
      authService.login.and.returnValue(throwError(() => errorResponse));

      component.login();

      expect(component.errorMessage).toBe('Invalid credentials');
    });

    it('should use default error message when error has no message', () => {
      component.username = 'testuser';
      component.password = 'wrongpass';
      authService.login.and.returnValue(throwError(() => ({ error: {} })));

      component.login();

      expect(component.errorMessage).toBe('Login failed. Please check your credentials.');
    });

    it('should not navigate on login failure', () => {
      component.username = 'testuser';
      component.password = 'wrongpass';
      authService.login.and.returnValue(throwError(() => new Error('Network error')));

      component.login();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('component properties', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(false);
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize with empty username', () => {
      expect(component.username).toBe('');
    });

    it('should initialize with empty password', () => {
      expect(component.password).toBe('');
    });

    it('should initialize with empty errorMessage', () => {
      expect(component.errorMessage).toBe('');
    });
  });
});
