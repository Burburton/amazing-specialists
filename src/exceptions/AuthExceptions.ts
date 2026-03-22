// T-003: AuthExceptions Implementation
// File: src/exceptions/AuthExceptions.ts

/**
 * Base Authentication Exception
 */
export class AuthException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AuthException';
    Object.setPrototypeOf(this, AuthException.prototype);
  }
}

/**
 * Invalid Credentials Exception
 * Thrown when username or password is incorrect
 * Returns 401 Unauthorized
 */
export class InvalidCredentialsException extends AuthException {
  constructor(
    message: string = '账号或密码错误'
  ) {
    super('INVALID_CREDENTIALS', message, 401);
    this.name = 'InvalidCredentialsException';
    Object.setPrototypeOf(this, InvalidCredentialsException.prototype);
  }
}

/**
 * User Not Found Exception
 * Thrown when user does not exist
 * Note: For security, this should be converted to InvalidCredentialsException
 * in production to avoid exposing user existence
 */
export class UserNotFoundException extends AuthException {
  constructor(
    message: string = '用户不存在'
  ) {
    super('USER_NOT_FOUND', message, 404);
    this.name = 'UserNotFoundException';
    Object.setPrototypeOf(this, UserNotFoundException.prototype);
  }
}

/**
 * Missing Parameters Exception
 * Thrown when required parameters are missing
 * Returns 400 Bad Request
 */
export class MissingParametersException extends AuthException {
  constructor(
    public readonly missingFields: string[],
    message: string = `缺少必填参数: ${missingFields.join(', ')}`
  ) {
    super('MISSING_PARAMETERS', message, 400);
    this.name = 'MissingParametersException';
    Object.setPrototypeOf(this, MissingParametersException.prototype);
  }
}

/**
 * Token Invalid Exception
 * Thrown when JWT token is invalid or expired
 * Returns 401 Unauthorized
 */
export class TokenInvalidException extends AuthException {
  constructor(
    message: string = 'Token 无效或已过期'
  ) {
    super('TOKEN_INVALID', message, 401);
    this.name = 'TokenInvalidException';
    Object.setPrototypeOf(this, TokenInvalidException.prototype);
  }
}
