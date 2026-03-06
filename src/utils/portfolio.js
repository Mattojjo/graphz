export const INITIAL_CASH = 100000;

const findStock = (stocks, symbol) => {
    if (Array.isArray(stocks)) return stocks.find(s => s.symbol === symbol);
    if (stocks && typeof stocks === 'object') return { currentPrice: stocks[symbol] };
    return undefined;
};

export const calculatePortfolioValue = (holdings, stocks) => {
    return holdings.reduce((total, holding) => {
        const stock = findStock(stocks, holding.symbol);
        const price = stock?.currentPrice ?? 0;
        return total + (holding.quantity * price);
    }, 0);
};

export const calculateTotalValue = (cash, holdings, stocks) => {
    return cash + calculatePortfolioValue(holdings, stocks);
};

export const calculateProfitLoss = (holding, currentPrice) => {
    const currentValue = holding.quantity * currentPrice;
    const investedValue = holding.quantity * holding.averagePrice;
    return currentValue - investedValue;
};

export const getPortfolioPerformance = (holdings, currentPrices) => {
    // holdings: [{symbol, quantity, purchasePrice}] and currentPrices: { SYMBOL: price }
    const invested = holdings.reduce((sum, h) => sum + (h.quantity * (h.purchasePrice ?? h.averagePrice ?? 0)), 0);
    const current = holdings.reduce((sum, h) => {
        const price = (currentPrices && typeof currentPrices === 'object') ? currentPrices[h.symbol] : (Array.isArray(currentPrices) ? (currentPrices.find(s=>s.symbol===h.symbol)?.currentPrice) : undefined);
        return sum + (h.quantity * (price ?? 0));
    }, 0);
    if (invested === 0) return 0;
    return (current - invested) / invested;
};

export const calculateProfitLossPercent = (holding, currentPrice) => {
    const profitLoss = calculateProfitLoss(holding, currentPrice);
    const investedValue = holding.quantity * holding.averagePrice;
    return (profitLoss / investedValue) * 100;
};

export const canBuyStock = (cash, price, quantity) => {
    return cash >= price * quantity;
};

const updateHolding = (holding, price, quantity) => {
    const totalQuantity = holding.quantity + quantity;
    const totalCost = holding.quantity * holding.averagePrice + price * quantity;
    return { ...holding, quantity: totalQuantity, averagePrice: totalCost / totalQuantity };
};

export const buyStock = (holdings, symbol, price, quantity) => {
    const existingHolding = holdings.find(h => h.symbol === symbol);

    if (existingHolding) {
        return holdings.map(h =>
            h.symbol === symbol ? updateHolding(h, price, quantity) : h
        );
    }

    return [...holdings, { symbol, quantity, averagePrice: price }];
};

export const sellStock = (holdings, symbol, quantity) => {
    return holdings
        .map(h => h.symbol === symbol ? { ...h, quantity: h.quantity - quantity } : h)
        .filter(h => h.quantity > 0);
};

export const getHoldingQuantity = (holdings, symbol) => {
    const holding = holdings.find(h => h.symbol === symbol);
    return holding?.quantity || 0;
};
