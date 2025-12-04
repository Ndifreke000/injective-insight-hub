/**
 * Format large numbers with M/B/T suffixes
 * Examples:
 * - 1234 -> "1,234"
 * - 1234567 -> "1.23M"
 * - 1234567890 -> "1.23B"
 * - 1234567890000 -> "1.23T"
 */
export function formatLargeNumber(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0';

    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    // Less than 1 million - show with commas
    if (absNum < 1_000_000) {
        return sign + absNum.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0
        });
    }

    // 1M - 999.99M
    if (absNum < 1_000_000_000) {
        return sign + (absNum / 1_000_000).toFixed(2) + 'M';
    }

    // 1B - 999.99B
    if (absNum < 1_000_000_000_000) {
        return sign + (absNum / 1_000_000_000).toFixed(2) + 'B';
    }

    // 1T+
    return sign + (absNum / 1_000_000_000_000).toFixed(2) + 'T';
}

/**
 * Format currency with $ prefix
 */
export function formatCurrency(value: number | string): string {
    return '$' + formatLargeNumber(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
    return value.toFixed(decimals) + '%';
}
