import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { initializeStocks, updateStockTick, getTimeframeMs } from '../utils/stockData';
import { fetchCandles, fetchQuotes } from '../utils/marketData';
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

const PRICE_UPDATE_INTERVAL = 500;
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
    const [timeframe, setTimeframe] = useState('1m');
    const [drawingTool, setDrawingTool] = useState('cursor');
    const [chartLines, setChartLines] = useState([]);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [dataSource, setDataSource] = useState('simulated');
    // Playback speed: how many real seconds it takes to complete one candle period
    // '1m' = 60s, '5m' = 300s, '15m' = 900s
    const [playbackSpeed, setPlaybackSpeed] = useState('1m');
    const timeframeRef = useRef(timeframe);
    const playbackSpeedRef = useRef(playbackSpeed);
    const simClockRef = useRef(null); // simulated Unix seconds

    useEffect(() => {
        timeframeRef.current = timeframe;
        // Reset sim clock whenever timeframe changes so next tick re-anchors
        simClockRef.current = null;
    }, [timeframe]);

    useEffect(() => {
        playbackSpeedRef.current = playbackSpeed;
    }, [playbackSpeed]);

    // Fetch real candle data from Yahoo Finance when symbol or timeframe changes
    useEffect(() => {
        if (!selectedStock?.symbol) return;

        if (timeframe === '1s') {
            setDataSource('simulated');
            return;
        }

        let cancelled = false;
        setIsChartLoading(true);

        fetchCandles(selectedStock.symbol, timeframe)
            .then(candles => {
                if (cancelled || !candles || candles.length === 0) return;
                setStocks(prev => prev.map(s =>
                    s.symbol === selectedStock.symbol
                        ? { ...s, historicalData: candles, currentPrice: candles[candles.length - 1].close }
                        : s
                ));
                setSelectedStock(prev =>
                    prev?.symbol === selectedStock.symbol
                        ? { ...prev, historicalData: candles, currentPrice: candles[candles.length - 1].close }
                        : prev
                );
                setDataSource('real');
            })
            .catch(err => {
                if (!cancelled) {
                    console.warn('[GraphZ] Yahoo Finance fetch failed, using simulation:', err.message);
                    setDataSource('simulated');
                }
            })
            .finally(() => {
                if (!cancelled) setIsChartLoading(false);
            });

        return () => { cancelled = true; };
    }, [selectedStock?.symbol, timeframe]);

    // Poll real-time prices every 30 seconds when on real data
    useEffect(() => {
        if (dataSource !== 'real') return;

        const poll = () => {
            fetchQuotes(stocks.map(s => s.symbol))
                .then(quotes => {
                    setStocks(prev => prev.map(s => {
                        const q = quotes[s.symbol];
                        if (!q || q.price == null) return s;
                        return { ...s, currentPrice: q.price, change: q.change, changePercent: q.changePercent };
                    }));
                })
                .catch(() => { /* silently ignore */ });
        };

        const id = setInterval(poll, 60000);
        return () => clearInterval(id);
    }, [dataSource, stocks.map(s => s.symbol).join(',')]);

    useEffect(() => {
        const TICK_SEC = PRICE_UPDATE_INTERVAL / 1000; // 0.5 seconds per tick
        const PLAYBACK_SECS = { '5s': 5, '1m': 60, '5m': 300, '15m': 900 };

        const interval = setInterval(() => {
            const tf = timeframeRef.current;
            const tfSec = getTimeframeMs(tf) / 1000;
            const playbackSec = PLAYBACK_SECS[playbackSpeedRef.current] ?? 60;

            // Advance simulated clock: each real tick moves sim time by tfSec/playbackSec * TICK_SEC
            // e.g. 1h candle with 1m playback: each 0.5s real tick → 30s sim advance
            const simAdvance = (tfSec / playbackSec) * TICK_SEC;

            setStocks(prevStocks => {
                // Anchor sim clock to last candle time on first tick after reset
                if (simClockRef.current === null) {
                    const anchor = prevStocks[0]?.historicalData?.slice(-1)[0]?.time;
                    simClockRef.current = anchor ? Number(anchor) : Math.floor(Date.now() / 1000);
                }
                simClockRef.current += simAdvance;

                return prevStocks.map(stock =>
                    updateStockTick(stock, tf, simClockRef.current)
                );
            });
        }, PRICE_UPDATE_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    // Keep selectedStock in sync with stocks array
    useEffect(() => {
        if (!selectedStock) return;
        setStocks(prev => {
            const found = prev.find(s => s.symbol === selectedStock.symbol);
            if (found) {
                // will be updated by the interval; no need to act here
            }
            return prev;
        });
    }, []);

    const createTransaction = (type, symbol, quantity, price, total) => ({
        type, symbol, quantity, price, total, timestamp: Date.now(),
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
        if (!stock || quantity <= 0) return false;
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
        if (!stock || quantity <= 0) return false;
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

    const createOrder = (orderData) => {
        const id = 'order_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        const order = {
            id,
            symbol: orderData.symbol,
            side: orderData.side,
            type: orderData.type || 'market',
            price: orderData.price ?? null,
            quantity: orderData.quantity || 1,
            status: 'pending',
            createdAt: Date.now()
        };
        setOrders(prev => [order, ...prev]);
        if (order.type === 'market') {
            const success = order.side === 'buy' ? buyStock(order.symbol, order.quantity) : sellStock(order.symbol, order.quantity);
            setOrders(prev => prev.map(o => o.id === id ? {
                ...o,
                status: success ? 'filled' : 'rejected',
                filledAt: success ? Date.now() : undefined,
                fillPrice: success ? (stocks.find(s => s.symbol === order.symbol)?.currentPrice) : undefined
            } : o));
        }
        return id;
    };

    const cancelOrder = (id) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled', cancelledAt: Date.now() } : o));
    };

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

    const addChartLine = (price) => {
        const id = 'line_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        setChartLines(prev => [...prev, { id, price, color: '#e4d354', label: '' }]);
    };

    const removeChartLine = (id) => {
        setChartLines(prev => prev.filter(l => l.id !== id));
    };

    const clearChartLines = () => setChartLines([]);

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

    // Always derive selectedStock from the live stocks array so the chart
    // receives every simulation tick update without needing a separate setter call.
    const liveSelectedStock = useMemo(
        () => selectedStock
            ? (stocks.find(s => s.symbol === selectedStock.symbol) ?? selectedStock)
            : null,
        [selectedStock, stocks]
    );

    const value = {
        stocks,
        cash,
        holdings,
        selectedStock: liveSelectedStock,
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
        timeframe,
        setTimeframe,
        drawingTool,
        setDrawingTool,
        chartLines,
        addChartLine,
        removeChartLine,
        clearChartLines,
        isChartLoading,
        dataSource,
        playbackSpeed,
        setPlaybackSpeed,
    };

    return (
        <TradingContext.Provider value={value}>
            {children}
        </TradingContext.Provider>
    );
};
