import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Portfolio from '../components/Portfolio'
import { TradingProvider } from '../context/TradingContext'

describe('Portfolio component', () => {
  const mockHoldings = [
    { symbol: 'AAPL', quantity: 10, purchasePrice: 150.25 },
    { symbol: 'GOOG', quantity: 5, purchasePrice: 2800.34 }
  ]

  it('renders without crashing', () => {
    const stocks = mockHoldings.map(h => ({ symbol: h.symbol, name: h.symbol, currentPrice: h.purchasePrice, changePercent: 0 }))
    render(<Portfolio />, { wrapper: ({ children }) => (<TradingProvider initialState={{ holdings: mockHoldings, stocks }}>{children}</TradingProvider>) })
    expect(screen.getByText(/portfolio/i)).toBeTruthy()
  })

  it('displays all portfolio holdings with correct information', () => {
    const stocks = mockHoldings.map(h => ({ symbol: h.symbol, name: h.symbol, currentPrice: h.purchasePrice, changePercent: 0 }))
    render(<Portfolio />, { wrapper: ({ children }) => (<TradingProvider initialState={{ holdings: mockHoldings, stocks }}>{children}</TradingProvider>) })

    mockHoldings.forEach(holding => {
      expect(screen.getAllByText(holding.symbol).length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(String(holding.quantity))).toBeTruthy()
    })
  })

  it('allows trading buttons to be present for each holding', async () => {
    const user = userEvent.setup()
    const stocks = mockHoldings.map(h => ({ symbol: h.symbol, name: h.symbol, currentPrice: h.purchasePrice, changePercent: 0 }))
    render(<Portfolio />, { wrapper: ({ children }) => (<TradingProvider initialState={{ holdings: mockHoldings, stocks }}>{children}</TradingProvider>) })

    const buyButtons = screen.getAllByRole('button', { name: /buy/i })
    expect(buyButtons.length).toBeGreaterThanOrEqual(mockHoldings.length)
  })
})