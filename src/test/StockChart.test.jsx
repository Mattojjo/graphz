import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import StockChart from '../components/StockChart'
import { TradingProvider } from '../context/TradingContext'

// Mock lightweight-charts so JSDOM doesn't choke on canvas/WebGL
vi.mock('lightweight-charts', () => ({
    createChart: vi.fn(() => ({
        addSeries: vi.fn(() => ({
            setData: vi.fn(),
            update: vi.fn(),
            applyOptions: vi.fn(),
            createPriceLine: vi.fn(() => ({})),
            removePriceLine: vi.fn(),
            coordinateToPrice: vi.fn(() => 150),
        })),
        priceScale: vi.fn(() => ({ applyOptions: vi.fn() })),
        timeScale: vi.fn(() => ({ scrollToRealTime: vi.fn(), fitContent: vi.fn() })),
        subscribeCrosshairMove: vi.fn(),
        subscribeClick: vi.fn(),
        unsubscribeCrosshairMove: vi.fn(),
        unsubscribeClick: vi.fn(),
        applyOptions: vi.fn(),
        resize: vi.fn(),
        remove: vi.fn(),
    })),
    CandlestickSeries: {},
    HistogramSeries: {},
    LineSeries: {},
}))

const mockData = [
    { time: 1672531200, open: 150.25, high: 152.34, low: 149.5, close: 151.0, volume: 1000 },
    { time: 1672617600, open: 151.0, high: 153.0, low: 150.0, close: 152.0, volume: 1200 },
    { time: 1672704000, open: 152.0, high: 156.0, low: 151.0, close: 155.0, volume: 900 },
]

describe('StockChart component', () => {
    it('renders without crashing', () => {
        const { container } = render(<StockChart />, {
            wrapper: ({ children }) => (
                <TradingProvider initialState={{
                    selectedStock: { symbol: 'TST', name: 'Test Stock', historicalData: mockData, changePercent: 0, currentPrice: 155 }
                }}>{children}</TradingProvider>
            )
        })
        expect(container.querySelector('[data-testid="chart-container"]')).toBeTruthy()
    })

    it('displays chart container', () => {
        const { container } = render(<StockChart />, {
            wrapper: ({ children }) => (
                <TradingProvider initialState={{
                    selectedStock: { symbol: 'TST', name: 'Test Stock', historicalData: mockData, changePercent: 0, currentPrice: 155 }
                }}>{children}</TradingProvider>
            )
        })
        const chartContainer = container.querySelector('[data-testid="chart-container"]')
        expect(chartContainer).toBeTruthy()
        expect(chartContainer.style.width).toBe('100%')
    })

    it('handles empty data gracefully', () => {
        render(<StockChart />, {
            wrapper: ({ children }) => (
                <TradingProvider initialState={{ selectedStock: null }}>{children}</TradingProvider>
            )
        })
        expect(screen.getByText(/select a stock to view chart/i)).toBeTruthy()
    })
})