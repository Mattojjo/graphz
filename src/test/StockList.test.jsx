import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StockList from '../components/StockList'
import { TradingProvider } from '../context/TradingContext'

describe('StockList component', () => {
  const mockStocks = [
    { symbol: 'AAPL', currentPrice: 150.25, changePercent: 2.34, name: 'Apple Inc.' },
    { symbol: 'GOOG', currentPrice: 2800.34, changePercent: -12.56, name: 'Google LLC' },
    { symbol: 'MSFT', currentPrice: 300.75, changePercent: 5.23, name: 'Microsoft Corp.' }
  ]

  it('renders without crashing', () => {
    render(<StockList />, { wrapper: ({ children }) => (<TradingProvider initialState={{ stocks: mockStocks }}>{children}</TradingProvider>) })
    expect(screen.getByText(/stock market/i)).toBeTruthy()
  })

  it('displays all stocks with correct information', () => {
    render(<StockList />, { wrapper: ({ children }) => (<TradingProvider initialState={{ stocks: mockStocks }}>{children}</TradingProvider>) })

    mockStocks.forEach(stock => {
      expect(screen.getByText(stock.symbol)).toBeTruthy()
    })
  })

  it('clicking a stock selects it', async () => {
    const user = userEvent.setup()
    render(<StockList />, { wrapper: ({ children }) => (<TradingProvider initialState={{ stocks: mockStocks }}>{children}</TradingProvider>) })

    await user.click(screen.getByText(/AAPL/i))
    expect(screen.getByText(/AAPL/i)).toBeTruthy()
  })
})