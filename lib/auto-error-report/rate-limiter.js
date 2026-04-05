const hourCounts = new Map();
const dayCounts = new Map();

function getCurrentHourKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}-${hour}`;
}

function getCurrentDayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function checkRateLimit(config) {
  const maxPerHour = config?.rate_limit?.max_per_hour || 5;
  const maxPerDay = config?.rate_limit?.max_per_day || 20;
  
  const hourKey = getCurrentHourKey();
  const dayKey = getCurrentDayKey();
  
  const hourCount = hourCounts.get(hourKey) || 0;
  const dayCount = dayCounts.get(dayKey) || 0;
  
  if (hourCount >= maxPerHour) {
    return {
      allowed: false,
      remaining_hour: 0,
      remaining_day: Math.max(0, maxPerDay - dayCount),
      reason: 'hour_limit'
    };
  }
  
  if (dayCount >= maxPerDay) {
    return {
      allowed: false,
      remaining_hour: Math.max(0, maxPerHour - hourCount),
      remaining_day: 0,
      reason: 'day_limit'
    };
  }
  
  return {
    allowed: true,
    remaining_hour: maxPerHour - hourCount,
    remaining_day: maxPerDay - dayCount
  };
}

function recordReport(errorHash, timestamp) {
  const hourKey = getCurrentHourKey();
  const dayKey = getCurrentDayKey();
  
  hourCounts.set(hourKey, (hourCounts.get(hourKey) || 0) + 1);
  dayCounts.set(dayKey, (dayCounts.get(dayKey) || 0) + 1);
  
  cleanupExpiredCounts();
}

function getHourCount() {
  const hourKey = getCurrentHourKey();
  return hourCounts.get(hourKey) || 0;
}

function getDayCount() {
  const dayKey = getCurrentDayKey();
  return dayCounts.get(dayKey) || 0;
}

function cleanupExpiredCounts() {
  const now = new Date();
  const currentHour = getCurrentHourKey();
  const currentDay = getCurrentDayKey();
  
  for (const key of hourCounts.keys()) {
    if (key.substring(0, 10) !== currentDay) {
      hourCounts.delete(key);
    }
  }
  
  for (const key of dayCounts.keys()) {
    if (key !== currentDay) {
      dayCounts.delete(key);
    }
  }
}

function clearAllCounts() {
  hourCounts.clear();
  dayCounts.clear();
}

module.exports = {
  checkRateLimit,
  recordReport,
  getHourCount,
  getDayCount,
  clearAllCounts,
  getCurrentHourKey,
  getCurrentDayKey
};