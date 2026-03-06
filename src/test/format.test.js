import { formatCurrency, formatPercentage, formatDateTime } from '../utils/format'

describe('format utils', () => {
  describe('formatCurrency', () => {
    it('should format numbers as currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00')
      expect(formatCurrency(1234.5678)).toBe('$1,234.57')
      expect(formatCurrency(0.99)).toBe('$0.99')
    })

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000.00')
    })
  })

  describe('formatPercentage', () => {
    it('should format numbers as percentage', () => {
      expect(formatPercentage(0.123456)).toBe('12.35%')
      expect(formatPercentage(0.5)).toBe('50.00%')
      expect(formatPercentage(1.23456)).toBe('123.46%')
    })

    it('should handle negative percentages', () => {
      expect(formatPercentage(-0.123456)).toBe('-12.35%')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2023-01-15T14:30:00Z')
      expect(formatDateTime(date)).toBe('Jan 15, 2023, 2:30 PM')
    })

    it('should handle different timezones', () => {
      const date = new Date('2023-01-15T14:30:00+05:30')
      expect(formatDateTime(date)).toBe('Jan 15, 2023, 9:00 AM') // Should adjust for timezone
    })
  })
})