import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StockChart from '../components/StockChart'
import { TradingProvider } from '../context/TradingContext'

describe('StockChart component', () => {
  const mockData = [
    { time: '2023-01-01', open: 150.25, high: 152.34, low: 149.5, close: 151.0, volume: 1000 },
    { time: '2023-01-02', open: 151.0, high: 153.0, low: 150.0, close: 152.0, volume: 1200 },
    { time: '2023-01-03', open: 152.0, high: 156.0, low: 151.0, close: 155.0, volume: 900 },
  ]

  it('renders without crashing', () => {
    render(<StockChart />, { wrapper: ({ children }) => (<TradingProvider initialState={{ selectedStock: { symbol: 'TST', name: 'Test Stock', historicalData: mockData, changePercent: 0, currentPrice: 155 } }}>{children}</TradingProvider>) })
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('displays chart canvas', () => {
    const { container } = render(<StockChart />, { wrapper: ({ children }) => (<TradingProvider initialState={{ selectedStock: { symbol: 'TST', name: 'Test Stock', historicalData: mockData, changePercent: 0, currentPrice: 155 } }}>{children}</TradingProvider>) })
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
    expect(canvas.className).toContain('w-full')
  })

  it('handles empty data gracefully', () => {
    render(<StockChart />, { wrapper: ({ children }) => (<TradingProvider initialState={{ selectedStock: null }}>{children}</TradingProvider>) })
    expect(screen.getByText(/select a stock to view chart/i)).toBeTruthy()
  })
})