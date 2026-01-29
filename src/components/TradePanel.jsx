import { useState } from 'react';
import { useTradingContext } from '../context/TradingContext';
import './TradePanel.css';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

const TradePanel = () => {
    const { selectedStock, cash, buyStock, sellStock, getHoldingQuantity } = useTradingContext();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('buy');

    if (!selectedStock) {
        return (
            <div className="trade-panel">
                <p className="no-selection">Select a stock to trade</p>
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

    const updateQuantity = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleQuantityChange = (e) => {
        setQuantity(Math.max(1, parseInt(e.target.value) || 1));
    };

    return (
        <div className="trade-panel">
            <h2>Trade {selectedStock.symbol}</h2>
            <div className="stock-info">
                <div className="info-row">
                    <span>Current Price:</span>
                    <span className="price">{formatCurrency(selectedStock.currentPrice)}</span>
                </div>
                <div className="info-row">
                    <span>Owned:</span>
                    <span>{currentHolding} shares</span>
                </div>
            </div>

            <div className="trade-tabs">
                <button
                    className={`tab ${activeTab === 'buy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('buy')}
                >
                    Buy
                </button>
                <button
                    className={`tab ${activeTab === 'sell' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sell')}
                >
                    Sell
                </button>
            </div>

            <div className="trade-form">
                <div className="quantity-control">
                    <label>Quantity</label>
                    <div className="quantity-input">
                        <button onClick={() => updateQuantity(-1)} className="qty-btn">-</button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min="1"
                        />
                        <button onClick={() => updateQuantity(1)} className="qty-btn">+</button>
                    </div>
                </div>

                <div className="trade-summary">
                    <div className="summary-row">
                        <span>Total:</span>
                        <span className="total">{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="summary-row">
                        <span>{activeTab === 'buy' ? 'Available Cash:' : 'Owned Shares:'}</span>
                        <span className={(activeTab === 'buy' ? canAfford : canSell) ? '' : 'insufficient'}>
                            {activeTab === 'buy' ? formatCurrency(cash) : currentHolding}
                        </span>
                    </div>
                </div>

                <button
                    className={`trade-button ${activeTab}-button`}
                    onClick={handleTrade}
                    disabled={activeTab === 'buy' ? !canAfford : !canSell}
                >
                    {activeTab === 'buy'
                        ? (canAfford ? `Buy ${quantity} Share${quantity > 1 ? 's' : ''}` : 'Insufficient Funds')
                        : (canSell ? `Sell ${quantity} Share${quantity > 1 ? 's' : ''}` : 'Insufficient Shares')}
                </button>
            </div>
        </div>
    );
};

export default TradePanel;
