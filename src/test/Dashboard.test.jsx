import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from '../components/Dashboard'
import { TradingProvider } from '../context/TradingContext'
import { vi } from 'vitest'

vi.mock('lightweight-charts', () => ({
    createChart: vi.fn(() => ({
        addSeries: vi.fn(() => ({
            setData: vi.fn(), update: vi.fn(), applyOptions: vi.fn(),
            createPriceLine: vi.fn(() => ({})), removePriceLine: vi.fn(),
            coordinateToPrice: vi.fn(() => 150),
        })),
        priceScale: vi.fn(() => ({ applyOptions: vi.fn() })),
        timeScale: vi.fn(() => ({ scrollToRealTime: vi.fn(), fitContent: vi.fn() })),
        subscribeCrosshairMove: vi.fn(), subscribeClick: vi.fn(),
        unsubscribeCrosshairMove: vi.fn(), unsubscribeClick: vi.fn(),
        applyOptions: vi.fn(), resize: vi.fn(), remove: vi.fn(),
    })),
    CandlestickSeries: {}, HistogramSeries: {}, LineSeries: {},
}))

describe('Dashboard component', () => {
    it('renders without crashing', () => {
        render(<Dashboard />, { wrapper: TradingProvider })
        expect(screen.getByText(/GraphZ/i)).toBeTruthy()
    })

    it('displays watchlist and stock info', () => {
        render(<Dashboard />, { wrapper: TradingProvider })
        expect(screen.getByText(/Watchlist/i)).toBeTruthy()
    })

    it('shows and hides portfolio on toggle', async () => {
        const user = userEvent.setup()
        render(<Dashboard />, { wrapper: TradingProvider })

        const portfolioBtn = screen.getByRole('button', { name: /toggle portfolio panel/i })
        await user.click(portfolioBtn)
        expect(screen.getByText(/Cash/i)).toBeTruthy()
    })
})