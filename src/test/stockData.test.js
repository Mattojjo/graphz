import stockData from '../utils/stockData'

describe('stockData utils', () => {
  describe('fetchStockData', () => {
    it('should fetch stock data successfully', async () => {
      // Mock the actual implementation
      const mockData = {
        symbol: 'AAPL',
        price: 150.25,
        change: 2.34,
        volume: 1000000
      }

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      })

      const result = await stockData.fetchStockData('AAPL')
      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('AAPL'))
    })

    it('should handle fetch errors', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

      await expect(stockData.fetchStockData('GOOG')).rejects.toThrow('Failed to fetch stock data')
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('GOOG'))
    })
  })
})