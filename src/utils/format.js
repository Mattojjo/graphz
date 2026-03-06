export const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(value);

// keep legacy name
export const formatPercent = (value, decimals = 2) => `${value.toFixed(decimals)}%`;

// export a formatPercentage that tests expect (input as decimal, e.g., 0.1234 -> 12.34%)
export const formatPercentage = (value, decimals = 2) => `${(value * 100).toFixed(decimals)}%`;

export const formatSignedPercent = (value, decimals = 2) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatDateTime = (date) => {
  // Format using UTC to make tests deterministic across environments
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'UTC'
  }).format(date);
};

export const formatVolume = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};
