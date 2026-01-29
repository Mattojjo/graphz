import { useState } from 'react';
import { useTradingContext } from '../context/TradingContext';
import './Portfolio.css';

const Portfolio = () => {
    const {
        cash,
        holdings,
        stocks,
        buyStock,
        sellStock,
        getPortfolioValue,
        getTotalValue,
        getInitialValue,
        getTotalProfitLoss,
        getTotalProfitLossPercent,
    } = useTradingContext();

    const [quantities, setQuantities] = useState({});

    const portfolioValue = getPortfolioValue();
    const totalValue = getTotalValue();
    const profitLoss = getTotalProfitLoss();
    const profitLossPercent = getTotalProfitLossPercent();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatPercent = (value) => {
        return value.toFixed(2) + '%';
    };

    const getQuantity = (symbol) => quantities[symbol] || 1;

    const setQuantity = (symbol, value) => {
        setQuantities(prev => ({
            ...prev,
            [symbol]: Math.max(1, parseInt(value) || 1)
        }));
    };

    const incrementQuantity = (symbol) => {
        setQuantity(symbol, getQuantity(symbol) + 1);
    };

    const decrementQuantity = (symbol) => {
        setQuantity(symbol, getQuantity(symbol) - 1);
    };

    const handleBuy = (symbol) => {
        const quantity = getQuantity(symbol);
        if (buyStock(symbol, quantity)) {
            setQuantities(prev => ({ ...prev, [symbol]: 1 }));
        }
    };

    const handleSell = (symbol) => {
        const quantity = getQuantity(symbol);
        if (sellStock(symbol, quantity)) {
            setQuantities(prev => ({ ...prev, [symbol]: 1 }));
        }
    };

    return (
        <div className="portfolio">
            <h2>Portfolio</h2>

            <div className="portfolio-summary">
                <div className="summary-card">
                    <span className="label">Total Value</span>
                    <span className="value">{formatCurrency(totalValue)}</span>
                </div>

                <div className="summary-card">
                    <span className="label">Cash</span>
                    <span className="value">{formatCurrency(cash)}</span>
                </div>

                <div className="summary-card">
                    <span className="label">Stocks Value</span>
                    <span className="value">{formatCurrency(portfolioValue)}</span>
                </div>

                <div className={`summary-card ${profitLoss >= 0 ? 'profit' : 'loss'}`}>
                    <span className="label">Profit/Loss</span>
                    <span className="value">
                        {formatCurrency(profitLoss)}
                        <span className="percent">({formatPercent(profitLossPercent)})</span>
                    </span>
                </div>
            </div>

            <div className="holdings">
                <h3>Your Holdings</h3>
                {holdings.length === 0 ? (
                    <p className="no-holdings">No stocks owned yet. Start trading!</p>
                ) : (
                    <div className="holdings-list">
                        {holdings.map(holding => {
                            const stock = stocks.find(s => s.symbol === holding.symbol);
                            if (!stock) return null;

                            const currentValue = holding.quantity * stock.currentPrice;
                            const investedValue = holding.quantity * holding.averagePrice;
                            const holdingPL = currentValue - investedValue;
                            const holdingPLPercent = (holdingPL / investedValue) * 100;
                            const quantity = getQuantity(holding.symbol);
                            const canAffordBuy = cash >= stock.currentPrice * quantity;
                            const canSell = holding.quantity >= quantity;

                            return (
                                <div key={holding.symbol} className="holding-item">
                                    <div className="holding-info">
                                        <span className="symbol">{holding.symbol}</span>
                                        <span className="name">{stock.name}</span>
                                    </div>
                                    <div className="holding-stats">
                                        <div className="stat">
                                            <span className="stat-label">Quantity</span>
                                            <span className="stat-value">{holding.quantity}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Avg Price</span>
                                            <span className="stat-value">{formatCurrency(holding.averagePrice)}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Current Price</span>
                                            <span className="stat-value">{formatCurrency(stock.currentPrice)}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Value</span>
                                            <span className="stat-value">{formatCurrency(currentValue)}</span>
                                        </div>
                                        <div className={`stat ${holdingPL >= 0 ? 'profit' : 'loss'}`}>
                                            <span className="stat-label">P/L</span>
                                            <span className="stat-value">
                                                {formatCurrency(holdingPL)} ({formatPercent(holdingPLPercent)})
                                            </span>
                                        </div>
                                    </div>

                                    <div className="holding-actions">
                                        <div className="quantity-control">
                                            <label>Qty</label>
                                            <div className="quantity-input-small">
                                                <button
                                                    onClick={() => decrementQuantity(holding.symbol)}
                                                    className="qty-btn-small"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(holding.symbol, e.target.value)}
                                                    min="1"
                                                />
                                                <button
                                                    onClick={() => incrementQuantity(holding.symbol)}
                                                    className="qty-btn-small"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn buy-btn"
                                                onClick={() => handleBuy(holding.symbol)}
                                                disabled={!canAffordBuy}
                                                title={!canAffordBuy ? 'Insufficient funds' : `Buy ${quantity} share${quantity > 1 ? 's' : ''}`}
                                            >
                                                Buy {quantity}
                                            </button>
                                            <button
                                                className="action-btn sell-btn"
                                                onClick={() => handleSell(holding.symbol)}
                                                disabled={!canSell}
                                                title={!canSell ? 'Insufficient shares' : `Sell ${quantity} share${quantity > 1 ? 's' : ''}`}
                                            >
                                                Sell {quantity}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;
