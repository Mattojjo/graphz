import { calculatePortfolioValue, getPortfolioPerformance } from '../utils/portfolio'

describe('portfolio utils', () => {
  const mockHoldings = [
    { symbol: 'AAPL', quantity: 10, purchasePrice: 150.25 },
    { symbol: 'GOOG', quantity: 5, purchasePrice: 2800.34 }
  ]

  describe('calculatePortfolioValue', () => {
    it('should calculate portfolio value correctly', () => {
      const currentPrices = {
        AAPL: 160.50,
        GOOG: 2850.75
      }

      const result = calculatePortfolioValue(mockHoldings, currentPrices)
      expect(result).toBeCloseTo((10 * 160.50) + (5 * 2850.75))
    })

    it('should handle empty portfolio', () => {
      const result = calculatePortfolioValue([], {})
      expect(result).toBe(0)
    })
  })

  describe('getPortfolioPerformance', () => {
    it('should calculate portfolio performance correctly', () => {
      const currentPrices = {
        AAPL: 160.50,
        GOOG: 2850.75
      }

      const result = getPortfolioPerformance(mockHoldings, currentPrices)
      expect(result).toBeGreaterThan(0) // Should show positive performance
    })

    it('should handle negative performance', () => {
      const currentPrices = {
        AAPL: 140.50,
        GOOG: 2700.75
      }

      const result = getPortfolioPerformance(mockHoldings, currentPrices)
      expect(result).toBeLessThan(0) // Should show negative performance
    })
  })
})