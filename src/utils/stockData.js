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

const DRIFT_FACTOR = 0.001;
const DRIFT_BIAS = 0.48;
const MIN_PRICE = 0.01;

export const generatePriceMovement = (currentPrice, volatility = 0.02) => {
    const drift = (Math.random() - DRIFT_BIAS) * DRIFT_FACTOR;
    const randomShock = (Math.random() - 0.5) * volatility;
    const priceChange = currentPrice * (drift + randomShock);
    return Math.max(currentPrice + priceChange, MIN_PRICE);
};

const VOLATILITY_FACTOR = 0.003;
const MIN_VOLUME = 500000;
const MAX_VOLUME = 1500000;
const MINUTE_MS = 60000;

const generateOHLC = (open, basePrice) => {
    const volatility = basePrice * VOLATILITY_FACTOR;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    return { open, high, low, close };
};

const generateVolume = () => {
    return Math.floor(Math.random() * (MAX_VOLUME - MIN_VOLUME)) + MIN_VOLUME;
};

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const generateHistoricalData = (basePrice, points = 100) => {
    const data = [];
    let price = basePrice;
    const now = Date.now();

    for (let i = points; i >= 0; i--) {
        const timestamp = now - (i * MINUTE_MS);
        const { open, high, low, close } = generateOHLC(price, basePrice);

        data.push({
            timestamp,
            price: close,
            open,
            high,
            low,
            close,
            volume: generateVolume(),
            time: formatTime(timestamp),
        });

        price = generatePriceMovement(close, 0.015);
    }

    return data;
};

export const initializeStocks = () => {
    return STOCKS.map(stock => ({
        ...stock,
        currentPrice: stock.basePrice,
        previousPrice: stock.basePrice,
        change: 0,
        changePercent: 0,
        historicalData: generateHistoricalData(stock.basePrice),
    }));
};

export const updateStockPrice = (stock) => {
    const lastData = stock.historicalData[stock.historicalData.length - 1];
    const { open, high, low, close } = generateOHLC(lastData.close, stock.basePrice);

    const change = close - stock.basePrice;
    const changePercent = (change / stock.basePrice) * 100;

    const newCandle = {
        timestamp: Date.now(),
        price: close,
        open,
        high,
        low,
        close,
        volume: generateVolume(),
        time: formatTime(Date.now()),
    };

    return {
        ...stock,
        previousPrice: stock.currentPrice,
        currentPrice: close,
        change,
        changePercent,
        historicalData: [...stock.historicalData.slice(1), newCandle],
    };
};
