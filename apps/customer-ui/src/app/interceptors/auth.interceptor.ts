import { HttpInterceptorFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/api/auth.service';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Skip adding token for auth endpoints (login/register/refresh)
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') || 
      req.url.includes('/auth/refresh')) {
    return next(req);
  }

  // Check if token is about to expire and refresh proactively
  if (authService.isTokenExpired() && authService.getRefreshToken()) {
    return authService.refreshAccessToken().pipe(
      switchMap(() => {
        const newToken = authService.getToken();
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        return next(clonedReq).pipe(
          catchError((error: HttpErrorResponse) => handleError(error, req, next, authService, router))
        );
      }),
      catchError((error) => {
        // If token refresh fails, logout and redirect to login
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  // Clone the request and add the authorization header if token exists
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => handleError(error, req, next, authService, router))
    );
  }

  return next(req);
};

/**
 * Handle HTTP errors, particularly 401 Unauthorized
 */
function handleError(
  error: HttpErrorResponse,
  req: any,
  next: any,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (error.status === 401) {
    const refreshToken = authService.getRefreshToken();
    
    // If we have a refresh token, try to refresh the access token
    if (refreshToken) {
      return authService.refreshAccessToken().pipe(
        switchMap((): Observable<HttpEvent<unknown>> => {
          // Retry the original request with the new token
          const newToken = authService.getToken();
          const clonedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
          return next(clonedReq);
        }),
        catchError((refreshError) => {
          // If refresh fails, logout and redirect to login
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    }
    
    // No refresh token available, logout and redirect to login
    authService.logout();
    router.navigate(['/login']);
  }

  return throwError(() => error);
}
