import { useTradingContext } from '../context/TradingContext';
import './StockList.css';

const StockList = () => {
    const { stocks, selectedStock, setSelectedStock } = useTradingContext();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatPercent = (value) => {
        const sign = value >= 0 ? '+' : '';
        return sign + value.toFixed(2) + '%';
    };

    return (
        <div className="stock-list">
            <h2>Stock Market</h2>
            <div className="stocks">
                {stocks.map(stock => {
                    const isSelected = selectedStock?.symbol === stock.symbol;
                    const isPositive = stock.changePercent >= 0;

                    return (
                        <div
                            key={stock.symbol}
                            className={`stock-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedStock(stock)}
                        >
                            <div className="stock-header">
                                <div>
                                    <div className="stock-symbol">{stock.symbol}</div>
                                    <div className="stock-name">{stock.name}</div>
                                </div>
                                <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                                    {formatPercent(stock.changePercent)}
                                </div>
                            </div>
                            <div className="stock-price">
                                {formatCurrency(stock.currentPrice)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StockList;
