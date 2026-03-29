/**
 * Token Manager
 * 
 * Manages GitHub authentication tokens with support for both
 * Personal Access Tokens (PAT) and GitHub App authentication.
 * 
 * @module token-manager
 * @see io-contract.md §8
 */

/**
 * Authentication method
 */
const AuthMethod = {
  PAT: 'pat',
  GITHUB_APP: 'github_app'
};

/**
 * Token Manager class
 */
class TokenManager {
  /**
   * @param {object} config - Authentication configuration
   */
  constructor(config) {
    this.config = config || {};
    this.primaryMethod = this.config.primary_method || 'github_app';
    this.fallbackMethod = this.config.fallback_method || 'pat';
    this.tokenEnvVar = this.config.token_env_var || 'GITHUB_TOKEN';
    this.appIdEnvVar = this.config.app_id_env_var || 'GITHUB_APP_ID';
    this.appPrivateKeyEnvVar = this.config.app_private_key_env_var || 'GITHUB_APP_PRIVATE_KEY';
    
    this._token = null;
    this._appToken = null;
    this._tokenExpiry = null;
  }

  /**
   * Get authentication token
   * Tries primary method first, falls back to secondary if unavailable
   * 
   * @returns {Promise<{token: string, method: string, valid: boolean}>}
   */
  async getToken() {
    if (this._token && this._isTokenValid()) {
      return {
        token: this._token,
        method: this._currentMethod,
        valid: true
      };
    }

    if (this.primaryMethod === 'github_app') {
      const appToken = await this._getGitHubAppToken();
      if (appToken) {
        return {
          token: appToken,
          method: 'github_app',
          valid: true
        };
      }
    }

    const patToken = this._getPATToken();
    if (patToken) {
      return {
        token: patToken,
        method: 'pat',
        valid: true
      };
    }

    return {
      token: null,
      method: null,
      valid: false
    };
  }

  /**
   * Check if current token is valid
   * @returns {boolean}
   */
  _isTokenValid() {
    if (!this._token) return false;
    if (this._currentMethod === 'pat') return true;
    
    if (this._tokenExpiry) {
      return new Date() < this._tokenExpiry;
    }
    
    return false;
  }

  /**
   * Get GitHub App installation token
   * @returns {Promise<string|null>}
   */
  async _getGitHubAppToken() {
    const appId = process.env[this.appIdEnvVar];
    const privateKey = process.env[this.appPrivateKeyEnvVar];

    if (!appId || !privateKey) {
      return null;
    }

    try {
      const { createAppAuth } = await import('@octokit/auth-app');
      
      const auth = createAppAuth({
        appId,
        privateKey,
        installationId: await this._getInstallationId(appId, privateKey)
      });

      const { token, expiresAt } = await auth({ type: 'installation' });
      
      this._token = token;
      this._currentMethod = 'github_app';
      this._tokenExpiry = new Date(expiresAt);

      return token;
    } catch (err) {
      console.warn(`GitHub App authentication failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Get installation ID for GitHub App
   * @param {string} appId 
   * @param {string} privateKey 
   * @returns {Promise<number>}
   */
  async _getInstallationId(appId, privateKey) {
    const { createAppAuth } = await import('@octokit/auth-app');
    const { Octokit } = await import('@octokit/rest');

    const appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: { appId, privateKey }
    });

    const installations = await appOctokit.apps.listInstallations();
    
    if (installations.data.length === 0) {
      throw new Error('No GitHub App installations found');
    }

    return installations.data[0].id;
  }

  /**
   * Get PAT token from environment
   * @returns {string|null}
   */
  _getPATToken() {
    const token = process.env[this.tokenEnvVar];
    
    if (token) {
      this._token = token;
      this._currentMethod = 'pat';
      this._tokenExpiry = null;
    }
    
    return token || null;
  }

  /**
   * Validate token has required scopes
   * @param {string} token 
   * @returns {Promise<{valid: boolean, scopes: string[]}>}
   */
  async validateTokenScopes(token) {
    try {
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: token });
      
      const response = await octokit.users.getAuthenticated();
      const scopes = response.headers['x-oauth-scopes']?.split(', ') || [];
      
      const requiredScopes = ['repo', 'pull_requests:write', 'contents:write'];
      const hasRequired = requiredScopes.some(scope => 
        scopes.includes(scope) || scopes.includes('repo')
      );

      return {
        valid: hasRequired,
        scopes
      };
    } catch (err) {
      return {
        valid: false,
        scopes: []
      };
    }
  }

  /**
   * Clear cached token
   */
  clearToken() {
    this._token = null;
    this._appToken = null;
    this._tokenExpiry = null;
    this._currentMethod = null;
  }

  /**
   * Get current authentication status
   * @returns {{configured: boolean, method: string|null}}
   */
  getStatus() {
    const hasPAT = !!process.env[this.tokenEnvVar];
    const hasApp = !!(process.env[this.appIdEnvVar] && process.env[this.appPrivateKeyEnvVar]);

    return {
      configured: hasPAT || hasApp,
      method: hasApp ? 'github_app' : (hasPAT ? 'pat' : null),
      pat_configured: hasPAT,
      app_configured: hasApp
    };
  }
}

module.exports = { TokenManager, AuthMethod };