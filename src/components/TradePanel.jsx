import { useState } from 'react';
import { useTradingContext } from '../context/TradingContext';
import './TradePanel.css';

const TradePanel = () => {
    const {
        selectedStock,
        cash,
        buyStock,
        sellStock,
        getHoldingQuantity
    } = useTradingContext();

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

    const handleBuy = () => {
        if (buyStock(selectedStock.symbol, quantity)) {
            setQuantity(1);
        }
    };

    const handleSell = () => {
        if (sellStock(selectedStock.symbol, quantity)) {
            setQuantity(1);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

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
                        <button onClick={decrementQuantity} className="qty-btn">-</button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                        />
                        <button onClick={incrementQuantity} className="qty-btn">+</button>
                    </div>
                </div>

                <div className="trade-summary">
                    <div className="summary-row">
                        <span>Total:</span>
                        <span className="total">{formatCurrency(totalCost)}</span>
                    </div>
                    {activeTab === 'buy' && (
                        <div className="summary-row">
                            <span>Available Cash:</span>
                            <span className={canAfford ? '' : 'insufficient'}>{formatCurrency(cash)}</span>
                        </div>
                    )}
                    {activeTab === 'sell' && (
                        <div className="summary-row">
                            <span>Owned Shares:</span>
                            <span className={canSell ? '' : 'insufficient'}>{currentHolding}</span>
                        </div>
                    )}
                </div>

                {activeTab === 'buy' ? (
                    <button
                        className="trade-button buy-button"
                        onClick={handleBuy}
                        disabled={!canAfford}
                    >
                        {canAfford ? `Buy ${quantity} Share${quantity > 1 ? 's' : ''}` : 'Insufficient Funds'}
                    </button>
                ) : (
                    <button
                        className="trade-button sell-button"
                        onClick={handleSell}
                        disabled={!canSell}
                    >
                        {canSell ? `Sell ${quantity} Share${quantity > 1 ? 's' : ''}` : 'Insufficient Shares'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TradePanel;
