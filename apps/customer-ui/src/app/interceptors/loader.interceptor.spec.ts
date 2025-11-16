import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { loaderInterceptor } from './loader.interceptor';
import { LoaderService } from '../services/loader.service';
import { of, Observable } from 'rxjs';

describe('loaderInterceptor', () => {
  let loaderService: jasmine.SpyObj<LoaderService>;
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => loaderInterceptor(req, next));

  beforeEach(() => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['show', 'hide']);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoaderService, useValue: loaderServiceSpy }
      ]
    });

    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
  });

  it('should call loaderService.show when interceptor is invoked', (done) => {
    const mockRequest = new HttpRequest('GET', '/test');
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));

    interceptor(mockRequest, next).subscribe(() => {
      expect(loaderService.show).toHaveBeenCalled();
      done();
    });
  });

  it('should call loaderService.hide when request completes', (done) => {
    const mockRequest = new HttpRequest('GET', '/test');
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));

    interceptor(mockRequest, next).subscribe({
      complete: () => {
        // finalize runs after complete, so we need to wait
        setTimeout(() => {
          expect(loaderService.hide).toHaveBeenCalled();
          done();
        }, 0);
      }
    });
  });

  it('should call loaderService.hide even on error', (done) => {
    const mockRequest = new HttpRequest('GET', '/test');
    const next = jasmine.createSpy('next').and.returnValue(
      new Observable((subscriber) => {
        subscriber.error(new Error('Test error'));
      })
    );

    interceptor(mockRequest, next).subscribe({
      error: () => {
        // finalize runs after error, so we need to wait
        setTimeout(() => {
          expect(loaderService.hide).toHaveBeenCalled();
          done();
        }, 0);
      }
    });
  });

  it('should call show before hide', (done) => {
    const mockRequest = new HttpRequest('GET', '/test');
    const mockResponse = new HttpResponse({ status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));
    const callOrder: string[] = [];

    loaderService.show.and.callFake(() => callOrder.push('show'));
    loaderService.hide.and.callFake(() => callOrder.push('hide'));

    interceptor(mockRequest, next).subscribe({
      complete: () => {
        // finalize runs after complete, so we need to wait
        setTimeout(() => {
          expect(callOrder).toEqual(['show', 'hide']);
          done();
        }, 0);
      }
    });
  });
});
