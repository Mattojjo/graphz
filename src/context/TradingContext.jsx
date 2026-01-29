import { createContext, useContext, useState, useEffect } from 'react';
import { initializeStocks, updateStockPrice } from '../utils/stockData';
import {
    INITIAL_CASH,
    buyStock as buyStockUtil,
    sellStock as sellStockUtil,
    canBuyStock,
    getHoldingQuantity,
    calculateTotalValue,
    calculatePortfolioValue
} from '../utils/portfolio';

const TradingContext = createContext();

export const useTradingContext = () => {
    const context = useContext(TradingContext);
    if (!context) {
        throw new Error('useTradingContext must be used within TradingProvider');
    }
    return context;
};

export const TradingProvider = ({ children }) => {
    const [stocks, setStocks] = useState([]);
    const [cash, setCash] = useState(INITIAL_CASH);
    const [holdings, setHoldings] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const initialStocks = initializeStocks();
        setStocks(initialStocks);
        setSelectedStock(initialStocks[0]);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(prevStocks => prevStocks.map(updateStockPrice));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const buyStock = (symbol, quantity) => {
        const stock = stocks.find(s => s.symbol === symbol);
        const totalCost = stock.currentPrice * quantity;

        if (!canBuyStock(cash, stock.currentPrice, quantity)) {
            showNotification('Insufficient funds!', 'error');
            return false;
        }

        setHoldings(prev => buyStockUtil(prev, symbol, stock.currentPrice, quantity));
        setCash(prev => prev - totalCost);

        addTransaction({
            type: 'BUY',
            symbol,
            quantity,
            price: stock.currentPrice,
            total: totalCost,
            timestamp: Date.now(),
        });

        showNotification(`Bought ${quantity} shares of ${symbol}`, 'success');
        return true;
    };

    const sellStock = (symbol, quantity) => {
        const stock = stocks.find(s => s.symbol === symbol);
        const currentHolding = getHoldingQuantity(holdings, symbol);

        if (currentHolding < quantity) {
            showNotification('Insufficient shares!', 'error');
            return false;
        }

        const totalValue = stock.currentPrice * quantity;
        setHoldings(prev => sellStockUtil(prev, symbol, quantity));
        setCash(prev => prev + totalValue);

        addTransaction({
            type: 'SELL',
            symbol,
            quantity,
            price: stock.currentPrice,
            total: totalValue,
            timestamp: Date.now(),
        });

        showNotification(`Sold ${quantity} shares of ${symbol}`, 'success');
        return true;
    };

    const addTransaction = (transaction) => {
        setTransactions(prev => [transaction, ...prev].slice(0, 50)); // Keep last 50 transactions
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const getPortfolioValue = () => calculatePortfolioValue(holdings, stocks);
    const getTotalValue = () => calculateTotalValue(cash, holdings, stocks);
    const getInitialValue = () => INITIAL_CASH;
    const getTotalProfitLoss = () => getTotalValue() - getInitialValue();
    const getTotalProfitLossPercent = () => (getTotalProfitLoss() / getInitialValue()) * 100;

    const value = {
        stocks,
        cash,
        holdings,
        selectedStock,
        setSelectedStock,
        transactions,
        notification,
        buyStock,
        sellStock,
        getPortfolioValue,
        getTotalValue,
        getInitialValue,
        getTotalProfitLoss,
        getTotalProfitLossPercent,
        getHoldingQuantity: (symbol) => getHoldingQuantity(holdings, symbol),
    };

    return (
        <TradingContext.Provider value={value}>
            {children}
        </TradingContext.Provider>
    );
};
