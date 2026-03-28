/**
 * Profile Configuration Loader
 * 
 * Reads templates/pack/pack-version.json and provides profile configuration.
 * Implements BR-004: Profile Configuration Load from ADAPTERS.md
 * Implements IR-004: Profile-Adapter Interface
 * 
 * @module adapters/shared/profile-loader
 */

const path = require('path');
const fs = require('fs');

const DEFAULT_TEMPLATE_PACK_PATH = path.resolve(__dirname, '../../templates/pack/pack-version.json');
const DEFAULT_TEMPLATE_PACK_DIR = path.resolve(__dirname, '../../templates/pack');

const PROFILE_CONFIG = {
  minimal: {
    file_count: 116,
    skill_count: 21,
    skills: {
      common: 5,
      architect: 3,
      developer: 3,
      tester: 3,
      reviewer: 3,
      docs: 2,
      security: 2
    },
    description: 'Essential execution layer with MVP skills',
    compatible_workspaces: ['local_repo', 'github_repo'],
    m4_enhanced: false
  },
  full: {
    file_count: 190,
    skill_count: 37,
    skills: {
      common: 5,
      architect: 5,
      developer: 5,
      tester: 9,
      reviewer: 5,
      docs: 4,
      security: 4
    },
    description: 'Complete execution layer with M4 enhancements',
    compatible_workspaces: ['local_repo', 'github_repo', 'external_system'],
    m4_enhanced: true
  }
};

const VALID_PROFILES = Object.keys(PROFILE_CONFIG);

/**
 * @typedef {Object} ProfileConfig
 * @property {string} profileName - Profile name (minimal/full)
 * @property {number} fileCount - Number of files in profile
 * @property {number} skillCount - Number of skills in profile
 * @property {Object} skills - Skill breakdown per role
 * @property {string} description - Profile description
 * @property {Array<string>} compatibleWorkspaces - Compatible workspace types
 * @property {boolean} m4Enhanced - Whether M4 enhancements are included
 * @property {string} version - Profile version from pack-version.json
 */

/**
 * @typedef {Object} ProfileLoaderResult
 * @property {string} status - Load status: 'SUCCESS' or 'BLOCKED'
 * @property {ProfileConfig|null} config - Profile configuration if successful
 * @property {Array<string>} errors - Error messages if blocked
 */

/**
 * Load pack-version.json from template pack
 * 
 * @param {string} packPath - Path to pack-version.json
 * @returns {Object} Pack version object
 * @throws {Error} If file cannot be read or parsed
 */
function loadPackVersion(packPath = DEFAULT_TEMPLATE_PACK_PATH) {
  try {
    const content = fs.readFileSync(packPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load pack-version.json from ${packPath}: ${error.message}`);
  }
}

/**
 * Get profile version from pack-version.json
 * 
 * @param {string} [packPath] - Optional path to pack-version.json
 * @returns {string} Profile version string
 */
function getProfileVersion(packPath = DEFAULT_TEMPLATE_PACK_PATH) {
  const packVersion = loadPackVersion(packPath);
  return packVersion.version || '1.0.0';
}

/**
 * Get template pack metadata
 * 
 * @param {string} [packPath] - Optional path to pack-version.json
 * @returns {Object} Template pack metadata
 */
function getTemplatePackInfo(packPath = DEFAULT_TEMPLATE_PACK_PATH) {
  const packVersion = loadPackVersion(packPath);
  
  return {
    version: packVersion.version,
    releaseDate: packVersion.release_date,
    packId: packVersion.template_pack_id,
    profiles: packVersion.profiles || {},
    compatibility: packVersion.compatibility || {},
    breakingChanges: packVersion.breaking_changes || [],
    deprecations: packVersion.deprecations || []
  };
}

/**
 * Get profile configuration by profile name
 * 
 * Implements BR-004 profile configuration load:
 * 1. Read templates/pack/pack-version.json
 * 2. Get profile version
 * 3. Load profile directory (minimal/ or full/)
 * 4. Return BLOCKED status if profile not found
 * 
 * Implements IR-004: Adapter must get profile config through unified interface
 * getProfileConfig(profile_name)
 * 
 * @param {string} profileName - Profile name ('minimal' or 'full')
 * @param {string} [packPath] - Optional path to pack-version.json
 * @returns {ProfileLoaderResult} Profile configuration result
 * 
 * @example
 * // Get minimal profile configuration
 * const result = getProfileConfig('minimal');
 * if (result.status === 'SUCCESS') {
 *   console.log(`Profile has ${result.config.skillCount} skills`);
 * } else {
 *   console.error('Profile not found:', result.errors);
 * }
 */
function getProfileConfig(profileName, packPath = DEFAULT_TEMPLATE_PACK_PATH) {
  const result = {
    status: 'BLOCKED',
    config: null,
    errors: []
  };
  
  if (!profileName) {
    result.errors.push('Profile name is required');
    return result;
  }
  
  const normalizedProfile = profileName.toLowerCase().trim();
  
  if (!VALID_PROFILES.includes(normalizedProfile)) {
    result.errors.push(`Invalid profile name: '${profileName}'. Valid profiles: ${VALID_PROFILES.join(', ')}`);
    return result;
  }
  
  try {
    const packVersion = loadPackVersion(packPath);
    const profileInfo = PROFILE_CONFIG[normalizedProfile];
    const packProfileInfo = packVersion.profiles && packVersion.profiles[normalizedProfile];
    
    result.status = 'SUCCESS';
    result.config = {
      profileName: normalizedProfile,
      fileCount: packProfileInfo ? packProfileInfo.file_count : profileInfo.file_count,
      skillCount: packProfileInfo ? packProfileInfo.skill_count : profileInfo.skill_count,
      skills: profileInfo.skills,
      description: packProfileInfo ? packProfileInfo.description : profileInfo.description,
      compatibleWorkspaces: profileInfo.compatible_workspaces,
      m4Enhanced: profileInfo.m4_enhanced,
      version: packVersion.version
    };
    
  } catch (error) {
    result.errors.push(`Failed to load profile configuration: ${error.message}`);
    result.status = 'BLOCKED';
  }
  
  return result;
}

/**
 * Check if profile is compatible with a workspace type
 * 
 * Implements IR-002: Workspace determines output format
 * Implements IR-003: Profile version compatibility check
 * 
 * @param {string} profileName - Profile name
 * @param {string} workspaceType - Workspace type
 * @param {string} [packPath] - Optional path to pack-version.json
 * @returns {Object} Compatibility check result
 */
function checkProfileWorkspaceCompatibility(profileName, workspaceType, packPath = DEFAULT_TEMPLATE_PACK_PATH) {
  const profileResult = getProfileConfig(profileName, packPath);
  
  const result = {
    isCompatible: false,
    profileName: profileName,
    workspaceType: workspaceType,
    errors: []
  };
  
  if (profileResult.status === 'BLOCKED') {
    result.errors = profileResult.errors;
    return result;
  }
  
  const compatibleWorkspaces = profileResult.config.compatibleWorkspaces;
  
  const normalizedWorkspace = workspaceType.toLowerCase().trim();
  
  if (compatibleWorkspaces.includes(normalizedWorkspace)) {
    result.isCompatible = true;
  } else {
    result.errors.push(`Profile '${profileName}' is not compatible with workspace type '${workspaceType}'`);
    result.errors.push(`Compatible workspaces for '${profileName}': ${compatibleWorkspaces.join(', ')}`);
  }
  
  return result;
}

/**
 * Get list of valid profile names
 * 
 * @returns {Array<string>} Valid profile names
 */
function getValidProfiles() {
  return VALID_PROFILES.slice();
}

/**
 * Get skill breakdown for a profile
 * 
 * Implements IR-001: Profile determines skill set
 * 
 * @param {string} profileName - Profile name
 * @returns {Object|null} Skill breakdown by role
 */
function getProfileSkillBreakdown(profileName) {
  const normalizedProfile = profileName ? profileName.toLowerCase().trim() : null;
  
  if (!normalizedProfile || !PROFILE_CONFIG[normalizedProfile]) {
    return null;
  }
  
  return PROFILE_CONFIG[normalizedProfile].skills;
}

/**
 * Check if profile includes M4 enhancements
 * 
 * @param {string} profileName - Profile name
 * @returns {boolean} Whether profile has M4 skills
 */
function isProfileEnhanced(profileName) {
  const normalizedProfile = profileName ? profileName.toLowerCase().trim() : null;
  
  if (!normalizedProfile || !PROFILE_CONFIG[normalizedProfile]) {
    return false;
  }
  
  return PROFILE_CONFIG[normalizedProfile].m4_enhanced;
}

/**
 * Get profile directory path
 * 
 * @param {string} profileName - Profile name
 * @param {string} [packDir] - Optional template pack directory
 * @returns {string|null} Profile directory path or null if invalid
 */
function getProfileDirectory(profileName, packDir = DEFAULT_TEMPLATE_PACK_DIR) {
  const normalizedProfile = profileName ? profileName.toLowerCase().trim() : null;
  
  if (!normalizedProfile || !VALID_PROFILES.includes(normalizedProfile)) {
    return null;
  }
  
  return path.join(packDir, normalizedProfile);
}

/**
 * Validate profile exists and is accessible
 * 
 * @param {string} profileName - Profile name
 * @param {string} [packDir] - Optional template pack directory
 * @returns {Object} Validation result
 */
function validateProfileExists(profileName, packDir = DEFAULT_TEMPLATE_PACK_DIR) {
  const result = {
    isValid: false,
    errors: []
  };
  
  const normalizedProfile = profileName ? profileName.toLowerCase().trim() : null;
  
  if (!normalizedProfile) {
    result.errors.push('Profile name is required');
    return result;
  }
  
  if (!VALID_PROFILES.includes(normalizedProfile)) {
    result.errors.push(`Invalid profile: '${profileName}'`);
    return result;
  }
  
  const profileDir = getProfileDirectory(normalizedProfile, packDir);
  
  if (fs.existsSync(profileDir)) {
    result.isValid = true;
    result.path = profileDir;
  } else {
    result.errors.push(`Profile directory not found: ${profileDir}`);
  }
  
  return result;
}

// CLI interface for testing
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node profile-loader.js <profileName>');
    console.log('       node profile-loader.js --version');
    console.log('       node profile-loader.js --info');
    console.log('       node profile-loader.js --check <profile> <workspace>');
    process.exit(1);
  }
  
  if (args[0] === '--version') {
    console.log(getProfileVersion());
    process.exit(0);
  }
  
  if (args[0] === '--info') {
    console.log(JSON.stringify(getTemplatePackInfo(), null, 2));
    process.exit(0);
  }
  
  if (args[0] === '--check') {
    const profile = args[1];
    const workspace = args[2];
    if (!profile || !workspace) {
      console.log('Usage: node profile-loader.js --check <profile> <workspace>');
      process.exit(1);
    }
    const result = checkProfileWorkspaceCompatibility(profile, workspace);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.isCompatible ? 0 : 1);
  }
  
  const profileName = args[0];
  const result = getProfileConfig(profileName);
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(result.status === 'SUCCESS' ? 0 : 1);
}

module.exports = {
  getProfileConfig,
  getProfileVersion,
  getTemplatePackInfo,
  checkProfileWorkspaceCompatibility,
  getValidProfiles,
  getProfileSkillBreakdown,
  isProfileEnhanced,
  getProfileDirectory,
  validateProfileExists,
  loadPackVersion,
  PROFILE_CONFIG
};