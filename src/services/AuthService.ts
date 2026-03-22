// T-004: AuthService Implementation - User Validation
// File: src/services/AuthService.ts

import bcrypt from 'bcrypt';
import { JwtTokenService } from './JwtTokenService';
import { InvalidCredentialsException } from '../exceptions/AuthExceptions';

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}

export class AuthService {
  private static readonly DUMMY_HASH = '$2b$10$abcdefghijklmnopqrstuv';

  constructor(private userRepository: { findByUsername(username: string): Promise<User | null> }) {}

  /**
   * Validate user credentials
   * @param username - Username
   * @param password - Plain text password
   * @returns User object if valid
   * @throws InvalidCredentialsException if invalid
   */
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username);
    
    if (!user) {
      // Perform dummy comparison to prevent timing attacks
      await bcrypt.compare('dummy', AuthService.DUMMY_HASH);
      throw new InvalidCredentialsException();
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  /**
   * Login user
   * @param credentials - Login credentials
   * @returns Login result with token and user info
   */
  async login(credentials: LoginRequest): Promise<LoginResult> {
    const user = await this.validateUser(credentials.username, credentials.password);
    
    const token = JwtTokenService.generateToken({
      user_id: user.id,
      username: user.username,
      roles: user.roles
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles
      }
    };
  }
}
