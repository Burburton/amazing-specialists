// T-006: AuthController Implementation
// File: src/controllers/AuthController.ts

import { AuthService, LoginRequest, LoginResult } from '../services/AuthService';
import { InvalidCredentialsException, MissingParametersException } from '../exceptions/AuthExceptions';

export interface LoginResponse {
  success: boolean;
  data?: LoginResult;
  error?: {
    code: string;
    message: string;
  };
}

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Handle user login request
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      // Validate required parameters
      const missingFields: string[] = [];
      if (!request.username) missingFields.push('username');
      if (!request.password) missingFields.push('password');
      
      if (missingFields.length > 0) {
        return {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: `缺少必填参数: ${missingFields.join(', ')}`
          }
        };
      }

      // Call auth service
      const result = await this.authService.login(request);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsException) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '账号或密码错误'
          }
        };
      }

      // Re-throw unexpected errors
      throw error;
    }
  }
}
