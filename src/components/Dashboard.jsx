import React, { useState } from 'react';
import { useTradingContext } from '../context/TradingContext';
import { useUI } from '../context/UIContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/format';
import StockList from './StockList';
import StockChart from './StockChart';
import TradePanel from './TradePanel';
import Portfolio from './Portfolio';
import ChartToolbar from './ChartToolbar';
import DrawingToolbar from './DrawingToolbar';
import Notification from './Notification';

const HeaderIconButton = ({ onClick, title, children }) => {
    const [hovered, setHovered] = React.useState(false);
    return (
        <button
            onClick={onClick}
            title={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '30px', height: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: hovered ? '#2a2e39' : 'transparent',
                border: '1px solid',
                borderColor: hovered ? '#363c4e' : 'transparent',
                color: hovered ? '#d1d4dc' : '#787b86',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                flexShrink: 0,
            }}
        >
            {children}
        </button>
    );
};

const Dashboard = () => {
    const { selectedStock, stocks } = useTradingContext();
    const { ui, togglePortfolio } = useUI();
    const { theme, toggleTheme } = useTheme();
    const [hoveredOHLC, setHoveredOHLC] = useState(null);

    const stock = stocks.find(s => s.symbol === selectedStock?.symbol) || selectedStock;
    const lastCandle = stock?.historicalData?.[stock.historicalData.length - 1];
    const ohlc = hoveredOHLC || (lastCandle ? {
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
    } : null);

    const changeColor = stock?.changePercent >= 0 ? '#26a69a' : '#ef5350';

    const fmt = (v) => v != null ? v.toFixed(2) : '—';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100vw',
            height: '100vh',
            background: '#131722',
            overflow: 'hidden',
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}>
            {/* TOP HEADER */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                minHeight: '48px',
                background: '#1e222d',
                borderBottom: '1px solid #2a2e39',
                padding: '0 16px',
                gap: '16px',
                flexShrink: 0,
            }}>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px', marginRight: '8px' }}>
                    GraphZ
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {stock && (
                        <>
                            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>
                                {stock.symbol}
                            </span>
                            <span style={{ color: '#d1d4dc', fontSize: '14px', fontWeight: 600 }}>
                                {formatCurrency(stock.currentPrice)}
                            </span>
                            <span style={{
                                color: changeColor,
                                fontSize: '13px',
                            }}>
                                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                            </span>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HeaderIconButton onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                        {theme === 'dark' ? (
                            /* Sun */
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        ) : (
                            /* Moon */
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        )}
                    </HeaderIconButton>
                    <HeaderIconButton title="Notifications">
                        {/* Bell */}
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </HeaderIconButton>
                </div>
            </div>

            {/* OHLC INFO BAR */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '32px',
                minHeight: '32px',
                background: '#1e2329',
                borderBottom: '1px solid #2a2e39',
                padding: '0 16px',
                gap: '16px',
                flexShrink: 0,
            }}>
                {ohlc ? (
                    <>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            O: <span style={{ color: '#d1d4dc' }}>{fmt(ohlc.open)}</span>
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            H: <span style={{ color: '#26a69a' }}>{fmt(ohlc.high)}</span>
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            L: <span style={{ color: '#ef5350' }}>{fmt(ohlc.low)}</span>
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            C: <span style={{ color: '#d1d4dc' }}>{fmt(ohlc.close)}</span>
                        </span>
                    </>
                ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                )}
            </div>

            {/* MAIN AREA */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
                {/* LEFT DRAWING TOOLBAR */}
                <DrawingToolbar />

                {/* CHART AREA */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <ChartToolbar />
                    <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                        <StockChart onHoverChange={setHoveredOHLC} />
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div style={{
                    width: '288px',
                    minWidth: '288px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#1e2329',
                    borderLeft: '1px solid #2a2e39',
                    overflow: 'hidden',
                }}>
                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="custom-scrollbar">
                        <StockList />
                    </div>
                    <div style={{ borderTop: '1px solid #2a2e39', overflowY: 'auto', maxHeight: '320px' }} className="custom-scrollbar">
                        <TradePanel />
                    </div>
                </div>
            </div>

            {/* BOTTOM PORTFOLIO STRIP */}
            <div style={{
                flexShrink: 0,
                background: '#1e2329',
                borderTop: '1px solid #2a2e39',
                transition: 'max-height 0.2s ease',
                maxHeight: ui.showPortfolio ? '256px' : '32px',
                overflow: 'hidden',
            }}>
                <button
                    onClick={togglePortfolio}
                    aria-label="Toggle portfolio panel"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '32px',
                        padding: '0 12px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        fontFamily: 'inherit',
                    }}
                >
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                        Portfolio
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {ui.showPortfolio ? '▼' : '▲'}
                    </span>
                </button>
                <div style={{ overflowY: 'auto', maxHeight: '224px' }} className="custom-scrollbar">
                    <Portfolio />
                </div>
            </div>

            <Notification />
        </div>
    );
};

export default Dashboard;
