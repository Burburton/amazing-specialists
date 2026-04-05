const crypto = require('crypto');

const errorHashes = new Map();

function computeErrorHash(errorReport) {
  const errorCode = errorReport?.error_details?.error_code || '';
  const title = errorReport?.error_details?.title || '';
  const dispatchId = errorReport?.error_context?.dispatch_id || '';
  
  const components = [errorCode, title, dispatchId].join(':');
  
  const hash = crypto
    .createHash('sha256')
    .update(components)
    .digest('hex')
    .substring(0, 16);
  
  return hash;
}

function isDuplicate(errorHash, dedupWindowMinutes) {
  const lastReport = errorHashes.get(errorHash);
  
  if (!lastReport) {
    return false;
  }
  
  const now = Date.now();
  const windowMs = dedupWindowMinutes * 60 * 1000;
  const elapsed = now - lastReport.getTime();
  
  return elapsed < windowMs;
}

function recordErrorHash(errorHash) {
  errorHashes.set(errorHash, new Date());
  cleanupExpiredHashes();
}

function cleanupExpiredHashes(maxAgeMinutes = 1440) {
  const now = Date.now();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  
  for (const [hash, timestamp] of errorHashes.entries()) {
    if (now - timestamp.getTime() > maxAgeMs) {
      errorHashes.delete(hash);
    }
  }
}

function clearAllHashes() {
  errorHashes.clear();
}

function getHashCount() {
  return errorHashes.size;
}

module.exports = {
  computeErrorHash,
  isDuplicate,
  recordErrorHash,
  cleanupExpiredHashes,
  clearAllHashes,
  getHashCount
};