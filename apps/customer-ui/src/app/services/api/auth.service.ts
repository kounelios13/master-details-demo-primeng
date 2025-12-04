import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, throwError, switchMap, catchError, filter, take, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  username: string;
}

export interface RegisterResponse {
  message: string;
  username: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  username: string;
}

interface TokenData {
  userId: number;
  username: string;
  exp: number; // Expiration timestamp in seconds
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userIdKey = 'user_id';
  
  // Token expiration buffer in seconds (5 minutes)
  private readonly TOKEN_EXPIRATION_BUFFER = 300;
  
  // Track if a token refresh is in progress to prevent multiple simultaneous refresh attempts
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      username,
      password,
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        this.setRefreshToken(response.refresh_token);
        
        // Extract user ID from the access token
        const tokenData = this.decodeToken(response.access_token);
        if (tokenData?.userId) {
          this.setUserId(tokenData.userId);
        }
      })
    );
  }

  register(username: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, {
      username,
      password,
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userIdKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getUserId(): number | null {
    const userId = localStorage.getItem(this.userIdKey);
    return userId ? parseInt(userId, 10) : null;
  }

  setUserId(userId: number): void {
    localStorage.setItem(this.userIdKey, userId.toString());
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if the access token is expired or about to expire
   * Returns true if token will expire within TOKEN_EXPIRATION_BUFFER seconds
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const tokenData = this.decodeToken(token);
    if (!tokenData?.exp) {
      return true;
    }

    // Check if token expires within the expiration buffer
    const currentTime = Math.floor(Date.now() / 1000);
    return tokenData.exp < currentTime + this.TOKEN_EXPIRATION_BUFFER;
  }

  /**
   * Refresh the access token using the refresh token
   */
  refreshAccessToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    const userId = this.getUserId();

    if (!refreshToken || !userId) {
      return throwError(() => new Error('No refresh token or user ID available'));
    }

    // If already refreshing, wait for the current refresh to complete
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => {
          // Return the response with the newly refreshed token
          const newToken = this.getToken();
          if (newToken) {
            const tokenData = this.decodeToken(newToken);
            return of({
              access_token: newToken,
              username: tokenData?.username || ''
            });
          }
          return throwError(() => new Error('Token refresh failed'));
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/auth/refresh`, {
      userId,
      refreshToken,
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.access_token);
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        // If refresh fails, logout the user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Decode a JWT token to extract payload data
   */
  private decodeToken(token: string): TokenData | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      
      return {
        userId: decoded.sub,
        username: decoded.username,
        exp: decoded.exp,
      };
    } catch (error) {
      return null;
    }
  }
}
