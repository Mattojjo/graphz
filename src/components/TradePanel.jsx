import React, { useState } from 'react';
import { useTradingContext } from '../context/TradingContext';
import { formatCurrency } from '../utils/format';

const labelStyle = {
    fontSize: '11px',
    color: 'var(--text-muted)',
};

const valueStyle = {
    fontSize: '13px',
    color: '#d1d4dc',
    fontWeight: 500,
};

const TradePanel = () => {
    const { selectedStock, cash, buyStock, sellStock, getHoldingQuantity } = useTradingContext();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('buy');

    if (!selectedStock) {
        return (
            <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                Select a stock to trade
            </div>
        );
    }

    const currentHolding = getHoldingQuantity(selectedStock.symbol);
    const totalCost = selectedStock.currentPrice * quantity;
    const canAfford = cash >= totalCost;
    const canSell = currentHolding >= quantity;

    const handleTrade = () => {
        const success = activeTab === 'buy'
            ? buyStock(selectedStock.symbol, quantity)
            : sellStock(selectedStock.symbol, quantity);
        if (success) setQuantity(1);
    };

    const handleQuantityChange = (e) => {
        setQuantity(Math.max(1, parseInt(e.target.value) || 1));
    };

    const isBuy = activeTab === 'buy';
    const canExecute = isBuy ? canAfford : canSell;

    return (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Header */}
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#d1d4dc', letterSpacing: '0.3px' }}>
                Trade {selectedStock.symbol}
            </div>

            {/* Buy/Sell tabs */}
            <div style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {['buy', 'sell'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            height: '28px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            background: activeTab === tab
                                ? (tab === 'buy' ? '#26a69a' : '#ef5350')
                                : 'transparent',
                            color: activeTab === tab ? '#ffffff' : 'var(--text-muted)',
                            transition: 'background 0.1s',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Price info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={labelStyle}>Current Price:</span>
                    <span style={valueStyle}>{formatCurrency(selectedStock.currentPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={labelStyle}>Available Cash</span>
                    <span style={valueStyle}>{formatCurrency(cash)}</span>
                </div>
                {activeTab === 'sell' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={labelStyle}>Holdings</span>
                        <span style={valueStyle}>{currentHolding} shares</span>
                    </div>
                )}
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={labelStyle}>Quantity</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        style={{
                            width: '28px', height: '28px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            color: '#d1d4dc',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontFamily: 'inherit',
                        }}
                    >−</button>
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min={1}
                        style={{
                            flex: 1,
                            height: '28px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            color: '#d1d4dc',
                            borderRadius: '3px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            padding: '0 4px',
                        }}
                    />
                    <button
                        onClick={() => setQuantity(q => q + 1)}
                        style={{
                            width: '28px', height: '28px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            color: '#d1d4dc',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontFamily: 'inherit',
                        }}
                    >+</button>
                </div>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={labelStyle}>Total</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: isBuy ? '#26a69a' : '#ef5350' }}>
                    {formatCurrency(totalCost)}
                </span>
            </div>

            {/* Execute button */}
            <button
                onClick={handleTrade}
                disabled={!canExecute}
                style={{
                    height: '34px',
                    background: canExecute
                        ? (isBuy ? '#26a69a' : '#ef5350')
                        : 'rgba(255,255,255,0.05)',
                    color: canExecute ? '#ffffff' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: canExecute ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontFamily: 'inherit',
                    transition: 'background 0.1s',
                }}
            >
                {isBuy ? 'Buy' : 'Sell'} {selectedStock.symbol}
            </button>

            {!canExecute && (
                <p style={{ fontSize: '11px', color: '#ef5350', textAlign: 'center', margin: 0 }}>
                    {isBuy ? 'Insufficient funds' : 'Insufficient shares'}
                </p>
            )}
        </div>
    );
};

export default TradePanel;
