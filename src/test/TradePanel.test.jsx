import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TradePanel from '../components/TradePanel'
import { TradingProvider } from '../context/TradingContext'

describe('TradePanel component', () => {
  const mockStockData = {
    symbol: 'AAPL',
    currentPrice: 150.25,
    change: 2.34,
    volume: 1000000
  }

  it('renders with selected stock', () => {
    render(<TradePanel />, { wrapper: ({ children }) => (<TradingProvider initialState={{ selectedStock: mockStockData, cash: 100000 }}>{children}</TradingProvider>) })
    expect(screen.getByText(/Trade AAPL/i)).toBeTruthy()
    expect(screen.getByText(/Current Price:/i)).toBeTruthy()
    const buyButtons = screen.getAllByRole('button', { name: /buy/i })
    expect(buyButtons.length).toBeGreaterThan(0)
  })
})