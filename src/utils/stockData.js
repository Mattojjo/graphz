// Mock stock data and price generation utilities

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

// Generate random price movement based on volatility
export const generatePriceMovement = (currentPrice, volatility = 0.02) => {
    // Random walk with drift
    const drift = (Math.random() - 0.48) * 0.001; // Slight upward bias
    const randomShock = (Math.random() - 0.5) * volatility;
    const priceChange = currentPrice * (drift + randomShock);

    return Math.max(currentPrice + priceChange, 0.01); // Prevent negative prices
};

// Generate historical price data for charts
export const generateHistoricalData = (basePrice, points = 100) => {
    const data = [];
    let price = basePrice;
    const now = Date.now();

    for (let i = points; i >= 0; i--) {
        const timestamp = now - (i * 60000); // 1 minute intervals
        data.push({
            timestamp,
            price: price,
            time: new Date(timestamp).toLocaleTimeString(),
        });
        price = generatePriceMovement(price, 0.015);
    }

    return data;
};

// Initialize stocks with current prices and historical data
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

// Update stock prices
export const updateStockPrice = (stock) => {
    const newPrice = generatePriceMovement(stock.currentPrice);
    const change = newPrice - stock.basePrice;
    const changePercent = ((newPrice - stock.basePrice) / stock.basePrice) * 100;

    // Update historical data
    const newHistoricalData = [...stock.historicalData.slice(1), {
        timestamp: Date.now(),
        price: newPrice,
        time: new Date().toLocaleTimeString(),
    }];

    return {
        ...stock,
        previousPrice: stock.currentPrice,
        currentPrice: newPrice,
        change,
        changePercent,
        historicalData: newHistoricalData,
    };
};
