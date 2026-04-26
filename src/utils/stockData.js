export const STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 175.50 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 142.30 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 378.85 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 151.25 },
    { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 248.50 },
    { symbol: 'META', name: 'Meta Platforms', basePrice: 484.03 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 505.48 },
    { symbol: 'NFLX', name: 'Netflix Inc.', basePrice: 597.32 },
    { symbol: 'AMD', name: 'AMD Inc.', basePrice: 152.70 },
    { symbol: 'INTC', name: 'Intel Corp.', basePrice: 43.85 },
];

export const TIMEFRAMES = ['1s', '1m', '3m', '5m', '15m', '1h', '2h', '4h', '1D'];

export const getTimeframeMs = (tf) => {
    const map = {
        '1s': 1000,
        '1m': 60000,
        '3m': 180000,
        '5m': 300000,
        '15m': 900000,
        '1h': 3600000,
        '2h': 7200000,
        '4h': 14400000,
        '1D': 86400000,
    };
    return map[tf] || 60000;
};

const DRIFT_FACTOR = 0.001;
const DRIFT_BIAS = 0.48;
const MIN_PRICE = 0.01;
const MIN_VOLUME = 500000;
const MAX_VOLUME = 1500000;

export const generatePriceMovement = (currentPrice, volatility = 0.02) => {
    const drift = (Math.random() - DRIFT_BIAS) * DRIFT_FACTOR;
    const randomShock = (Math.random() - 0.5) * volatility;
    const priceChange = currentPrice * (drift + randomShock);
    return Math.max(currentPrice + priceChange, MIN_PRICE);
};

const generateVolume = () =>
    Math.floor(Math.random() * (MAX_VOLUME - MIN_VOLUME)) + MIN_VOLUME;

export const generateHistoricalDataForTimeframe = (basePrice, timeframe, points = 150) => {
    const tfMs = getTimeframeMs(timeframe);
    const data = [];
    let price = basePrice;
    const nowSec = Math.floor(Date.now() / 1000);
    const tfSec = Math.floor(tfMs / 1000);

    for (let i = points - 1; i >= 0; i--) {
        const time = nowSec - i * tfSec;
        const volatility = basePrice * 0.003;
        const open = price;
        const high = open + Math.random() * volatility;
        const low = open - Math.random() * volatility;
        const close = low + Math.random() * (high - low);
        data.push({ time, open, high, low, close, volume: generateVolume() });
        price = generatePriceMovement(close, 0.015);
    }

    return data;
};

// Keep old function name for backward compat (used in tests)
export const generateHistoricalData = (basePrice, points = 100) => {
    return generateHistoricalDataForTimeframe(basePrice, '1m', points);
};

export const initializeStocks = () => {
    return STOCKS.map(stock => ({
        ...stock,
        currentPrice: stock.basePrice,
        previousPrice: stock.basePrice,
        change: 0,
        changePercent: 0,
        historicalData: generateHistoricalDataForTimeframe(stock.basePrice, '1m'),
    }));
};

export const updateStockTick = (stock, timeframe = '1m') => {
    const tfMs = getTimeframeMs(timeframe);
    const tfSec = Math.floor(tfMs / 1000);
    const nowSec = Math.floor(Date.now() / 1000);

    const historicalData = [...stock.historicalData];
    const lastCandle = historicalData[historicalData.length - 1];

    // Generate a small tick movement
    const newPrice = generatePriceMovement(stock.currentPrice, 0.005);

    const currentPeriodStart = lastCandle.time;
    const periodExpired = nowSec >= currentPeriodStart + tfSec;

    if (!periodExpired) {
        // Update current candle in place
        const updated = {
            ...lastCandle,
            high: Math.max(lastCandle.high, newPrice),
            low: Math.min(lastCandle.low, newPrice),
            close: newPrice,
        };
        historicalData[historicalData.length - 1] = updated;
    } else {
        // Start a new candle
        const newCandleTime = currentPeriodStart + tfSec;
        const newCandle = {
            time: newCandleTime,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, newPrice),
            low: Math.min(lastCandle.close, newPrice),
            close: newPrice,
            volume: generateVolume(),
        };
        historicalData.push(newCandle);
        // Keep only last 200 candles
        if (historicalData.length > 200) historicalData.shift();
    }

    const change = newPrice - stock.basePrice;
    const changePercent = (change / stock.basePrice) * 100;

    return {
        ...stock,
        previousPrice: stock.currentPrice,
        currentPrice: newPrice,
        change,
        changePercent,
        historicalData,
    };
};

// Keep old function for backward compat
export const updateStockPrice = (stock) => updateStockTick(stock, '1m');

export const fetchStockData = async (symbol) => {
    try {
        const res = await fetch(`https://api.example.com/stocks/${symbol}`);
        if (!res.ok) throw new Error('Failed to fetch stock data');
        return res.json();
    } catch (e) {
        throw new Error('Failed to fetch stock data');
    }
};

export default { fetchStockData };
