import { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

const PRICE_UPDATE_INTERVAL = 2000;
const MAX_TRANSACTIONS = 50;
const NOTIFICATION_DURATION = 3000;

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
        }, PRICE_UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    const createTransaction = (type, symbol, quantity, price, total) => ({
        type,
        symbol,
        quantity,
        price,
        total,
        timestamp: Date.now(),
    });

    const addTransaction = (transaction) => {
        setTransactions(prev => [transaction, ...prev].slice(0, MAX_TRANSACTIONS));
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), NOTIFICATION_DURATION);
    };

    const buyStock = (symbol, quantity) => {
        const stock = stocks.find(s => s.symbol === symbol);
        if (!stock || quantity <= 0) {
            return false;
        }

        const totalCost = stock.currentPrice * quantity;

        if (!canBuyStock(cash, stock.currentPrice, quantity)) {
            showNotification('Insufficient funds!', 'error');
            return false;
        }

        setHoldings(prev => buyStockUtil(prev, symbol, stock.currentPrice, quantity));
        setCash(prev => prev - totalCost);
        addTransaction(createTransaction('BUY', symbol, quantity, stock.currentPrice, totalCost));
        showNotification(`Bought ${quantity} shares of ${symbol}`, 'success');
        return true;
    };

    const sellStock = (symbol, quantity) => {
        const stock = stocks.find(s => s.symbol === symbol);
        if (!stock || quantity <= 0) {
            return false;
        }
        const currentHolding = getHoldingQuantity(holdings, symbol);

        if (currentHolding < quantity) {
            showNotification('Insufficient shares!', 'error');
            return false;
        }

        const totalValue = stock.currentPrice * quantity;
        setHoldings(prev => sellStockUtil(prev, symbol, quantity));
        setCash(prev => prev + totalValue);
        addTransaction(createTransaction('SELL', symbol, quantity, stock.currentPrice, totalValue));
        showNotification(`Sold ${quantity} shares of ${symbol}`, 'success');
        return true;
    };

    const portfolioValue = useMemo(
        () => calculatePortfolioValue(holdings, stocks),
        [holdings, stocks]
    );

    const totalValue = useMemo(
        () => calculateTotalValue(cash, holdings, stocks),
        [cash, holdings, stocks]
    );

    const totalProfitLoss = useMemo(
        () => totalValue - INITIAL_CASH,
        [totalValue]
    );

    const totalProfitLossPercent = useMemo(
        () => (totalProfitLoss / INITIAL_CASH) * 100,
        [totalProfitLoss]
    );

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
        getPortfolioValue: () => portfolioValue,
        getTotalValue: () => totalValue,
        getInitialValue: () => INITIAL_CASH,
        getTotalProfitLoss: () => totalProfitLoss,
        getTotalProfitLossPercent: () => totalProfitLossPercent,
        getHoldingQuantity: (symbol) => getHoldingQuantity(holdings, symbol),
    };

    return (
        <TradingContext.Provider value={value}>
            {children}
        </TradingContext.Provider>
    );
};
