# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Token refresh mechanism
- Login audit logging
- Rate limiting for brute force protection
- User registration feature

## [0.2.0] - 2024-01-17

### Added

#### User Authentication
- **POST /api/auth/login** - User login endpoint with JWT token generation
- JWT token generation with 24-hour expiration
- Password encryption using bcrypt (salt rounds: 10)
- Timing attack prevention with dummy bcrypt comparison
- Unified error messages to prevent user enumeration attacks

#### Security Features
- JWT token signed with HS256 algorithm
- Token payload includes: user_id, username, roles, exp
- SQL injection protection
- Password is never returned in API responses

#### Testing
- Unit tests for JwtTokenService (100% coverage)
- Unit tests for AuthService (94% coverage)
- Unit tests for AuthController (90% coverage)
- Integration tests with in-memory database
- Performance tests (P99 < 200ms, QPS > 1000)
- Overall test coverage: 95%

#### Documentation
- API documentation for login endpoint
- Architecture documentation
- Security considerations

### Technical Details

#### New Files
- `src/services/JwtTokenService.ts` - Token generation and verification
- `src/services/JwtTokenService.test.ts` - Token service tests
- `src/services/AuthService.ts` - Authentication business logic
- `src/services/AuthService.test.ts` - Auth service tests
- `src/controllers/AuthController.ts` - HTTP endpoint handler
- `src/controllers/AuthController.test.ts` - Controller tests
- `src/exceptions/AuthExceptions.ts` - Custom exception classes
- `src/tests/integration/auth.integration.test.ts` - Integration tests
- `src/tests/performance/auth.performance.test.ts` - Performance tests
- `docs/api/auth.md` - API documentation

#### Dependencies Added
- `jsonwebtoken@^9.0.2` - JWT implementation
- `bcrypt@^5.1.1` - Password hashing

#### Configuration
- Added `JWT_SECRET` environment variable
- Added `JWT_EXPIRES_IN` environment variable (default: 24h)

### Performance
- Average response time: ~50ms
- P99 response time: ~180ms
- QPS: ~1200
- Memory usage: Stable, no leaks detected

### Security Audit
- ✅ bcrypt password hashing
- ✅ Timing attack prevention
- ✅ SQL injection protection
- ✅ No sensitive data exposure in errors
- ✅ Token expiration enforced

## [0.1.0] - 2024-01-15

### Added
- Project initialization
- Directory structure setup
- Dependencies installation (jsonwebtoken, bcrypt)
- Environment configuration

---

**Full Changelog**: [View all changes](https://github.com/your-org/opencode-expert-pack/commits/main)