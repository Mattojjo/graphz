import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

export const TradingProvider = ({ children, initialState = {} }) => {
    const initialStocks = initialState.stocks || initializeStocks();
    const [stocks, setStocks] = useState(initialStocks);
    const [cash, setCash] = useState(initialState.cash ?? INITIAL_CASH);
    const [holdings, setHoldings] = useState(initialState.holdings || []);
    const [selectedStock, setSelectedStock] = useState(
        Object.prototype.hasOwnProperty.call(initialState, 'selectedStock') ? initialState.selectedStock : (initialStocks[0] || null)
    );
    const [transactions, setTransactions] = useState(initialState.transactions || []);
    const [notification, setNotification] = useState(initialState.notification || null);
    const [orders, setOrders] = useState(initialState.orders || []);

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
        const id = Date.now();
        setNotification({ id, message, type });
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

    // Orders API
    const createOrder = (orderData) => {
        const id = 'order_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        const order = {
            id,
            symbol: orderData.symbol,
            side: orderData.side, // 'buy' | 'sell'
            type: orderData.type || 'market', // 'market' | 'limit' | 'stop'
            price: orderData.price ?? null,
            quantity: orderData.quantity || 1,
            status: 'pending',
            createdAt: Date.now()
        };
        setOrders(prev => [order, ...prev]);

        // Execute market orders immediately
        if (order.type === 'market') {
            const success = order.side === 'buy' ? buyStock(order.symbol, order.quantity) : sellStock(order.symbol, order.quantity);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: success ? 'filled' : 'rejected', filledAt: success ? Date.now() : undefined, fillPrice: success ? (stocks.find(s => s.symbol === order.symbol)?.currentPrice) : undefined } : o));
        }
        return id;
    };

    const cancelOrder = (id) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled', cancelledAt: Date.now() } : o));
    };

    // Evaluate pending limit/stop orders when prices update
    useEffect(() => {
        if (!orders.length) return;
        setOrders(prevOrders => {
            const updated = prevOrders.map(o => ({ ...o }));
            updated.forEach(order => {
                if (order.status !== 'pending') return;
                const stock = stocks.find(s => s.symbol === order.symbol);
                if (!stock) return;
                const price = stock.currentPrice;
                let shouldFill = false;
                if (order.type === 'limit') {
                    if (order.side === 'buy' && price <= order.price) shouldFill = true;
                    if (order.side === 'sell' && price >= order.price) shouldFill = true;
                } else if (order.type === 'stop') {
                    if (order.side === 'buy' && price >= order.price) shouldFill = true;
                    if (order.side === 'sell' && price <= order.price) shouldFill = true;
                }
                if (!shouldFill) return;
                const success = order.side === 'buy' ? buyStock(order.symbol, order.quantity) : sellStock(order.symbol, order.quantity);
                if (success) {
                    order.status = 'filled';
                    order.filledAt = Date.now();
                    order.fillPrice = price;
                } else {
                    order.status = 'rejected';
                    order.rejectionReason = 'Insufficient funds or shares';
                }
            });
            return updated;
        });
    }, [stocks]);

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
        orders,
        createOrder,
        cancelOrder,
    };

    return (
        <TradingContext.Provider value={value}>
            {children}
        </TradingContext.Provider>
    );
};
