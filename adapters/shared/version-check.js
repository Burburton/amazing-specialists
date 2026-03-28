/**
 * Version Compatibility Checker
 * 
 * Reads compatibility-matrix.json and checks adapter version vs package version compatibility.
 * Implements BR-003: Version Compatibility Check from ADAPTERS.md
 * 
 * @module adapters/shared/version-check
 */

const path = require('path');
const fs = require('fs');

// Default paths for compatibility matrix
const DEFAULT_COMPATIBILITY_MATRIX_PATH = path.resolve(__dirname, '../../compatibility-matrix.json');

/**
 * @typedef {Object} VersionCompatibilityResult
 * @property {string} status - Compatibility status: 'COMPATIBLE', 'COMPATIBLE_WITH_MIGRATION', 'BLOCKED'
 * @property {string} adapterVersion - The adapter version being checked
 * @property {string} packageVersion - The package version being checked against
 * @property {boolean} isCompatible - Whether versions are compatible
 * @property {boolean} migrationRequired - Whether migration is required
 * @property {Object|null} migrationHints - Migration hints if migration required
 * @property {Array<string>} errors - Error messages if incompatible
 */

/**
 * Load compatibility matrix from file
 * 
 * @param {string} matrixPath - Path to compatibility-matrix.json
 * @returns {Object} Compatibility matrix object
 * @throws {Error} If matrix file cannot be read or parsed
 */
function loadCompatibilityMatrix(matrixPath = DEFAULT_COMPATIBILITY_MATRIX_PATH) {
  try {
    const content = fs.readFileSync(matrixPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load compatibility matrix from ${matrixPath}: ${error.message}`);
  }
}

/**
 * Parse semantic version string into components
 * 
 * @param {string} version - Version string (e.g., "1.0.0")
 * @returns {Object} Version components {major, minor, patch}
 */
function parseVersion(version) {
  const parts = version.split('.');
  return {
    major: parseInt(parts[0] || '0', 10),
    minor: parseInt(parts[1] || '0', 10),
    patch: parseInt(parts[2] || '0', 10)
  };
}

/**
 * Compare two semantic versions
 * 
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);
  
  if (parsed1.major !== parsed2.major) {
    return parsed1.major < parsed2.major ? -1 : 1;
  }
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor < parsed2.minor ? -1 : 1;
  }
  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch < parsed2.patch ? -1 : 1;
  }
  return 0;
}

/**
 * Check version compatibility between adapter and package
 * 
 * Implements BR-003 version compatibility check:
 * 1. Read compatibility-matrix.json
 * 2. Check adapter version vs package version
 * 3. Return BLOCKED status if incompatible
 * 4. Return migration hints if migration needed
 * 
 * @param {string} adapterVersion - Adapter version to check
 * @param {string} packageVersion - Package version to check against
 * @param {string} [matrixPath] - Optional path to compatibility matrix
 * @returns {VersionCompatibilityResult} Compatibility check result
 * 
 * @example
 * // Check if adapter version 1.0.0 is compatible with package version 1.0.0
 * const result = checkVersionCompatibility('1.0.0', '1.0.0');
 * if (result.status === 'COMPATIBLE') {
 *   // Proceed with adapter initialization
 * } else if (result.status === 'BLOCKED') {
 *   // Cannot use this adapter version
 *   console.error(result.errors);
 * }
 */
function checkVersionCompatibility(adapterVersion, packageVersion, matrixPath = DEFAULT_COMPATIBILITY_MATRIX_PATH) {
  // Load compatibility matrix
  const matrix = loadCompatibilityMatrix(matrixPath);
  
  // Initialize result object
  const result = {
    status: 'COMPATIBLE',
    adapterVersion: adapterVersion,
    packageVersion: packageVersion,
    isCompatible: true,
    migrationRequired: false,
    migrationHints: null,
    errors: []
  };
  
  // Check if package version exists in matrix
  if (!matrix.compatibility || !matrix.compatibility[packageVersion]) {
    result.status = 'BLOCKED';
    result.isCompatible = false;
    result.errors.push(`Package version ${packageVersion} not found in compatibility matrix`);
    return result;
  }
  
  const versionCompatibility = matrix.compatibility[packageVersion];
  
  // Check incompatible_with list
  if (versionCompatibility.incompatible_with && 
      versionCompatibility.incompatible_with.includes(adapterVersion)) {
    result.status = 'BLOCKED';
    result.isCompatible = false;
    result.errors.push(`Adapter version ${adapterVersion} is incompatible with package version ${packageVersion}`);
    return result;
  }
  
  // Check migration_required_from list
  if (versionCompatibility.migration_required_from && 
      versionCompatibility.migration_required_from.includes(adapterVersion)) {
    result.status = 'COMPATIBLE_WITH_MIGRATION';
    result.isCompatible = true;
    result.migrationRequired = true;
    
    // Get migration hints from migration_paths
    const migrationKey = `to_${packageVersion}`;
    if (matrix.migration_paths && matrix.migration_paths[migrationKey]) {
      result.migrationHints = {
        description: matrix.migration_paths[migrationKey].description,
        guide: matrix.migration_paths[migrationKey].migration_guide,
        estimatedEffort: matrix.migration_paths[migrationKey].estimated_effort
      };
    } else {
      result.migrationHints = {
        description: 'Migration required but no guide available',
        guide: null,
        estimatedEffort: 'Unknown'
      };
    }
    return result;
  }
  
  // Check component compatibility (contract_pack, template_pack, tooling)
  const componentChecks = checkComponentCompatibility(adapterVersion, packageVersion, matrix);
  if (componentChecks.errors.length > 0) {
    result.errors.push(...componentChecks.errors);
    if (componentChecks.hasIncompatible) {
      result.status = 'BLOCKED';
      result.isCompatible = false;
    }
  }
  
  // Apply upgrade rules for version comparison
  const adapterParsed = parseVersion(adapterVersion);
  const packageParsed = parseVersion(packageVersion);
  
  // Major version mismatch is always BLOCKED
  if (adapterParsed.major !== packageParsed.major) {
    if (result.status !== 'BLOCKED') {
      result.status = 'BLOCKED';
      result.isCompatible = false;
      result.errors.push(`Major version mismatch: adapter ${adapterVersion} vs package ${packageVersion}`);
    }
  }
  
  // Minor version: adapter can be older (backward compatible)
  if (adapterParsed.major === packageParsed.major && 
      compareVersions(adapterVersion, packageVersion) < 0) {
    // Older adapter version is compatible with newer package (minor/patch)
    // This is acceptable for backward compatibility
  }
  
  return result;
}

/**
 * Check component-level compatibility
 * 
 * @param {string} adapterVersion - Adapter version
 * @param {string} packageVersion - Package version
 * @param {Object} matrix - Compatibility matrix
 * @returns {Object} Component compatibility result
 */
function checkComponentCompatibility(adapterVersion, packageVersion, matrix) {
  const result = {
    errors: [],
    hasIncompatible: false,
    components: {}
  };
  
  // Check contract_pack compatibility
  if (matrix.component_compatibility && matrix.component_compatibility.contract_pack) {
    for (const [version, compat] of Object.entries(matrix.component_compatibility.contract_pack)) {
      if (compat.compatible_package_versions && !compat.compatible_package_versions.includes(packageVersion)) {
        result.errors.push(`Contract pack version ${version} is not compatible with package version ${packageVersion}`);
      }
      result.components.contract_pack = {
        version: version,
        compatible: compat.compatible_package_versions.includes(packageVersion)
      };
    }
  }
  
  // Check template_pack compatibility
  if (matrix.component_compatibility && matrix.component_compatibility.template_pack) {
    for (const [version, compat] of Object.entries(matrix.component_compatibility.template_pack)) {
      if (compat.compatible_package_versions && !compat.compatible_package_versions.includes(packageVersion)) {
        result.errors.push(`Template pack version ${version} is not compatible with package version ${packageVersion}`);
      }
      result.components.template_pack = {
        version: version,
        compatible: compat.compatible_package_versions.includes(packageVersion)
      };
      
      // Check profile compatibility
      if (compat.profiles) {
        result.components.profiles = {};
        for (const [profileName, profileCompat] of Object.entries(compat.profiles)) {
          result.components.profiles[profileName] = {
            skill_count: profileCompat.skill_count,
            compatible: profileCompat.compatible_with_package.includes(packageVersion)
          };
        }
      }
    }
  }
  
  // Check tooling compatibility
  if (matrix.component_compatibility && matrix.component_compatibility.tooling) {
    for (const [version, compat] of Object.entries(matrix.component_compatibility.tooling)) {
      if (compat.compatible_package_versions && !compat.compatible_package_versions.includes(packageVersion)) {
        result.errors.push(`Tooling version ${version} is not compatible with package version ${packageVersion}`);
      }
      result.components.tooling = {
        version: version,
        compatible: compat.compatible_package_versions.includes(packageVersion)
      };
    }
  }
  
  // Determine if any component is incompatible
  for (const component of Object.values(result.components)) {
    if (component.compatible === false) {
      result.hasIncompatible = true;
      break;
    }
  }
  
  return result;
}

/**
 * Get latest compatible version from matrix
 * 
 * @param {string} packageVersion - Package version
 * @param {string} [matrixPath] - Optional path to compatibility matrix
 * @returns {string|null} Latest compatible adapter version or null
 */
function getLatestCompatibleVersion(packageVersion, matrixPath = DEFAULT_COMPATIBILITY_MATRIX_PATH) {
  const matrix = loadCompatibilityMatrix(matrixPath);
  
  // Get the latest version from version_history
  if (matrix.version_history && matrix.version_history.length > 0) {
    const latest = matrix.version_history[matrix.version_history.length - 1];
    return latest.version;
  }
  
  return null;
}

/**
 * Validate version sync rules (AH-007)
 * 
 * Checks if version declarations are synchronized across:
 * - Package version
 * - Contract pack version
 * - Template pack version
 * 
 * @param {string} [matrixPath] - Optional path to compatibility matrix
 * @returns {Object} Validation result with sync status
 */
function validateVersionSync(matrixPath = DEFAULT_COMPATIBILITY_MATRIX_PATH) {
  const matrix = loadCompatibilityMatrix(matrixPath);
  
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    syncStatus: {}
  };
  
  // Check version_history exists
  if (!matrix.version_history || matrix.version_history.length === 0) {
    result.isValid = false;
    result.errors.push('No version history found in compatibility matrix');
    return result;
  }
  
  // Get latest version info
  const latestVersion = matrix.version_history[matrix.version_history.length - 1];
  const packageVersion = latestVersion.version;
  
  result.syncStatus.package_version = packageVersion;
  result.syncStatus.contract_pack_version = latestVersion.contract_pack_version;
  result.syncStatus.template_pack_version = latestVersion.template_pack_version;
  result.syncStatus.tooling_version = latestVersion.tooling_version;
  
  // Validate MAJOR version sync (per VERSIONING.md)
  const packageMajor = parseVersion(packageVersion).major;
  const contractMajor = parseVersion(latestVersion.contract_pack_version).major;
  const templateMajor = parseVersion(latestVersion.template_pack_version).major;
  
  if (packageMajor !== contractMajor) {
    result.isValid = false;
    result.errors.push(`MAJOR version mismatch: package ${packageMajor} vs contract_pack ${contractMajor}`);
  }
  
  if (packageMajor !== templateMajor) {
    result.isValid = false;
    result.errors.push(`MAJOR version mismatch: package ${packageMajor} vs template_pack ${templateMajor}`);
  }
  
  return result;
}

// CLI interface for testing
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node version-check.js <adapterVersion> <packageVersion>');
    console.log('       node version-check.js --sync');
    console.log('       node version-check.js --latest <packageVersion>');
    process.exit(1);
  }
  
  if (args[0] === '--sync') {
    const result = validateVersionSync();
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.isValid ? 0 : 1);
  }
  
  if (args[0] === '--latest') {
    const packageVersion = args[1];
    const latest = getLatestCompatibleVersion(packageVersion);
    console.log(JSON.stringify({ latestCompatibleVersion: latest }, null, 2));
    process.exit(0);
  }
  
  const adapterVersion = args[0];
  const packageVersion = args[1];
  
  const result = checkVersionCompatibility(adapterVersion, packageVersion);
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(result.isCompatible ? 0 : 1);
}

module.exports = {
  checkVersionCompatibility,
  loadCompatibilityMatrix,
  parseVersion,
  compareVersions,
  checkComponentCompatibility,
  getLatestCompatibleVersion,
  validateVersionSync
};