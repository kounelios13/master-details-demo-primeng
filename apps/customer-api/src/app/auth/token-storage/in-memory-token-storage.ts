import { Injectable } from '@nestjs/common';
import { ITokenStorage } from '../interfaces/token-storage.interface';

interface TokenData {
  token: string;
  expiresAt: Date;
}

/**
 * In-memory implementation of token storage
 * Stores refresh tokens in memory with expiration tracking
 */
@Injectable()
export class InMemoryTokenStorage implements ITokenStorage {
  private tokens: Map<number, TokenData> = new Map();

  async store(userId: number, refreshToken: string, expiresAt: Date): Promise<void> {
    this.tokens.set(userId, { token: refreshToken, expiresAt });
  }

  async get(userId: number): Promise<string | null> {
    const tokenData = this.tokens.get(userId);
    
    if (!tokenData) {
      return null;
    }

    // Check if token has expired
    if (new Date() > tokenData.expiresAt) {
      this.tokens.delete(userId);
      return null;
    }

    return tokenData.token;
  }

  async delete(userId: number): Promise<void> {
    this.tokens.delete(userId);
  }

  async verify(userId: number, refreshToken: string): Promise<boolean> {
    const storedToken = await this.get(userId);
    return storedToken === refreshToken;
  }

  async cleanupExpired(): Promise<void> {
    const now = new Date();
    const expiredUserIds: number[] = [];

    for (const [userId, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expiresAt) {
        expiredUserIds.push(userId);
      }
    }

    for (const userId of expiredUserIds) {
      this.tokens.delete(userId);
    }
  }
}
