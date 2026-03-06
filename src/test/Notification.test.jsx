import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Notification from '../components/Notification'
import { TradingProvider } from '../context/TradingContext'

describe('Notification component', () => {
  const mockNotifications = [
    { id: 1, message: 'Trade executed successfully', type: 'success' },
    { id: 2, message: 'Insufficient funds for this trade', type: 'error' }
  ]

  it('renders without crashing', () => {
    render(<Notification notifications={mockNotifications} />, { wrapper: TradingProvider })
    expect(screen.getByText(mockNotifications[0].message)).toBeTruthy()
  })

  it('displays all notifications with correct types', () => {
    render(<Notification notifications={mockNotifications} />, { wrapper: TradingProvider })

    const first = screen.getByText(mockNotifications[0].message).parentElement
    const second = screen.getByText(mockNotifications[1].message).parentElement
    expect(first.className).toContain('bg-green-100')
    expect(second.className).toContain('bg-red-100')
  })

  it('dismisses notification when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<Notification notifications={mockNotifications} />, { wrapper: TradingProvider })

    await user.click(screen.getAllByRole('button')[0])
    expect(screen.queryByText(mockNotifications[0].message)).toBeNull()
  })
})