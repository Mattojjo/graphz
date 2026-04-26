import React from 'react';
import { useTradingContext } from '../context/TradingContext';
import { formatCurrency } from '../utils/format';

const StockList = () => {
    const { stocks, selectedStock, setSelectedStock } = useTradingContext();

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
                padding: '8px 12px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: 'var(--text-muted)',
                background: 'var(--panel-bg)',
                position: 'sticky',
                top: 0,
                borderBottom: '1px solid var(--border)',
                zIndex: 1,
            }}>
                Watchlist
            </div>

            {stocks.map(stock => {
                const isSelected = selectedStock?.symbol === stock.symbol;
                const isPositive = stock.changePercent >= 0;

                return (
                    <div
                        key={stock.symbol}
                        onClick={() => setSelectedStock(stock)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(41,98,255,0.1)' : 'transparent',
                            borderLeft: isSelected ? '2px solid #2962ff' : '2px solid transparent',
                            transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                        onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#ffffff',
                                lineHeight: 1.2,
                            }}>
                                {stock.symbol}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.3,
                            }}>
                                {stock.name}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontSize: '13px', color: '#d1d4dc', fontWeight: 500 }}>
                                {formatCurrency(stock.currentPrice)}
                            </span>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: isPositive ? '#26a69a' : '#ef5350',
                                background: isPositive ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)',
                                padding: '1px 5px',
                                borderRadius: '3px',
                            }}>
                                {isPositive ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StockList;
