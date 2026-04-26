import React from 'react';
import { useTradingContext } from '../context/TradingContext';
import { formatCurrency, formatPercent } from '../utils/format';

const Portfolio = () => {
    const {
        cash,
        holdings,
        stocks,
        getPortfolioValue,
        getTotalValue,
        getTotalProfitLoss,
        getTotalProfitLossPercent,
    } = useTradingContext();

    const portfolioValue = getPortfolioValue();
    const totalValue = getTotalValue();
    const profitLoss = getTotalProfitLoss();
    const profitLossPercent = getTotalProfitLossPercent();
    const plColor = profitLoss >= 0 ? '#26a69a' : '#ef5350';

    const enrichedHoldings = holdings.map(h => {
        const stock = stocks.find(s => s.symbol === h.symbol);
        const currentPrice = stock?.currentPrice ?? h.averagePrice;
        const currentValue = currentPrice * h.quantity;
        const costBasis = h.averagePrice * h.quantity;
        const pnl = currentValue - costBasis;
        const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
        return { ...h, currentPrice, currentValue, pnl, pnlPct };
    });

    return (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                    { label: 'Cash', value: formatCurrency(cash), color: '#d1d4dc' },
                    { label: 'Portfolio', value: formatCurrency(portfolioValue), color: '#d1d4dc' },
                    { label: 'Total Value', value: formatCurrency(totalValue), color: '#d1d4dc' },
                    {
                        label: 'P/L',
                        value: (profitLoss >= 0 ? '+' : '') + formatCurrency(profitLoss) + ' (' + (profitLossPercent >= 0 ? '+' : '') + profitLossPercent.toFixed(2) + '%)',
                        color: plColor,
                    },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px 8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Holdings */}
            {enrichedHoldings.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
                    {enrichedHoldings.map(h => (
                        <div key={h.symbol} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '8px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{h.symbol}</span>
                                <span style={{ fontSize: '11px', color: h.pnl >= 0 ? '#26a69a' : '#ef5350', fontWeight: 600 }}>
                                    {h.pnl >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                                </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{h.quantity} @ {formatCurrency(h.averagePrice)}</span>
                                <span style={{ color: '#d1d4dc' }}>{formatCurrency(h.currentValue)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>
                    No holdings yet
                </div>
            )}
        </div>
    );
};

export default Portfolio;
