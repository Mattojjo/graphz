export const INITIAL_CASH = 100000;

const findStock = (stocks, symbol) => {
    if (Array.isArray(stocks)) return stocks.find(s => s.symbol === symbol);
    if (stocks && typeof stocks === 'object') return { currentPrice: stocks[symbol] };
    return undefined;
};

export const calculatePortfolioValue = (holdings, stocks) =>
    holdings.reduce((total, h) => {
        const price = findStock(stocks, h.symbol)?.currentPrice ?? 0;
        return total + h.quantity * price;
    }, 0);

export const calculateTotalValue = (cash, holdings, stocks) =>
    cash + calculatePortfolioValue(holdings, stocks);

export const calculateProfitLoss = (holding, currentPrice) => {
    const currentValue  = holding.quantity * currentPrice;
    const investedValue = holding.quantity * holding.averagePrice;
    return currentValue - investedValue;
};

export const calculateProfitLossPercent = (holding, currentPrice) => {
    const profitLoss    = calculateProfitLoss(holding, currentPrice);
    const investedValue = holding.quantity * holding.averagePrice;
    return (profitLoss / investedValue) * 100;
};

export const getPortfolioPerformance = (holdings, currentPrices) => {
    const getPrice = (symbol) =>
        typeof currentPrices === 'object' && !Array.isArray(currentPrices)
            ? currentPrices[symbol]
            : currentPrices?.find?.(s => s.symbol === symbol)?.currentPrice;

    const invested = holdings.reduce((sum, h) =>
        sum + h.quantity * (h.purchasePrice ?? h.averagePrice ?? 0), 0);
    const current  = holdings.reduce((sum, h) =>
        sum + h.quantity * (getPrice(h.symbol) ?? 0), 0);

    return invested === 0 ? 0 : (current - invested) / invested;
};

export const canBuyStock = (cash, price, quantity) =>
    cash >= price * quantity;

const updateHolding = (holding, price, quantity) => {
    const totalQuantity = holding.quantity + quantity;
    const totalCost     = holding.quantity * holding.averagePrice + price * quantity;
    return { ...holding, quantity: totalQuantity, averagePrice: totalCost / totalQuantity };
};

export const buyStock = (holdings, symbol, price, quantity) => {
    const existing = holdings.find(h => h.symbol === symbol);
    if (existing) return holdings.map(h => h.symbol === symbol ? updateHolding(h, price, quantity) : h);
    return [...holdings, { symbol, quantity, averagePrice: price }];
};

export const sellStock = (holdings, symbol, quantity) =>
    holdings
        .map(h => h.symbol === symbol ? { ...h, quantity: h.quantity - quantity } : h)
        .filter(h => h.quantity > 0);

export const getHoldingQuantity = (holdings, symbol) =>
    holdings.find(h => h.symbol === symbol)?.quantity ?? 0;
