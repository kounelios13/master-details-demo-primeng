/**
 * Interface for storing and managing refresh tokens
 * This allows for different implementations (in-memory, Redis, etc.)
 */
export interface ITokenStorage {
  /**
   * Store a refresh token for a user
   * @param userId - The user ID
   * @param refreshToken - The refresh token to store
   * @param expiresAt - The expiration timestamp
   */
  store(userId: number, refreshToken: string, expiresAt: Date): Promise<void>;

  /**
   * Retrieve a refresh token for a user
   * @param userId - The user ID
   * @returns The refresh token if found and not expired, null otherwise
   */
  get(userId: number): Promise<string | null>;

  /**
   * Delete a refresh token for a user
   * @param userId - The user ID
   */
  delete(userId: number): Promise<void>;

  /**
   * Verify if a refresh token is valid for a user
   * @param userId - The user ID
   * @param refreshToken - The refresh token to verify
   * @returns True if valid, false otherwise
   */
  verify(userId: number, refreshToken: string): Promise<boolean>;

  /**
   * Clean up expired tokens
   */
  cleanupExpired(): Promise<void>;
}
