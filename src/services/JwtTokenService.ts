// T-002: JwtTokenService Implementation
// File: src/services/JwtTokenService.ts

import jwt from 'jsonwebtoken';

export interface TokenPayload {
  user_id: string;
  username: string;
  roles: string[];
  exp?: number;
}

export class JwtTokenService {
  private static readonly SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

  /**
   * Generate JWT Token
   * @param payload - Token payload (user_id, username, roles)
   * @returns JWT Token string
   */
  static generateToken(payload: Omit<TokenPayload, 'exp'>): string {
    const token = jwt.sign(
      {
        user_id: payload.user_id,
        username: payload.username,
        roles: payload.roles
      },
      this.SECRET,
      {
        expiresIn: this.EXPIRES_IN,
        algorithm: 'HS256'
      }
    );
    return token;
  }

  /**
   * Verify JWT Token (for future use)
   * @param token - JWT Token string
   * @returns Decoded payload
   */
  static verifyToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.SECRET) as TokenPayload;
    return decoded;
  }
}
