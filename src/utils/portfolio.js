// Portfolio management utilities

export const INITIAL_CASH = 100000; // Starting with $100,000

export const calculatePortfolioValue = (holdings, stocks) => {
    return holdings.reduce((total, holding) => {
        const stock = stocks.find(s => s.symbol === holding.symbol);
        return total + (holding.quantity * stock.currentPrice);
    }, 0);
};

export const calculateTotalValue = (cash, holdings, stocks) => {
    const portfolioValue = calculatePortfolioValue(holdings, stocks);
    return cash + portfolioValue;
};

export const calculateProfitLoss = (holding, currentPrice) => {
    const currentValue = holding.quantity * currentPrice;
    const investedValue = holding.quantity * holding.averagePrice;
    return currentValue - investedValue;
};

export const calculateProfitLossPercent = (holding, currentPrice) => {
    const profitLoss = calculateProfitLoss(holding, currentPrice);
    const investedValue = holding.quantity * holding.averagePrice;
    return (profitLoss / investedValue) * 100;
};

export const canBuyStock = (cash, price, quantity) => {
    return cash >= (price * quantity);
};

export const buyStock = (holdings, symbol, price, quantity) => {
    const existingHolding = holdings.find(h => h.symbol === symbol);

    if (existingHolding) {
        const totalQuantity = existingHolding.quantity + quantity;
        const totalCost = (existingHolding.quantity * existingHolding.averagePrice) + (price * quantity);

        return holdings.map(h =>
            h.symbol === symbol
                ? { ...h, quantity: totalQuantity, averagePrice: totalCost / totalQuantity }
                : h
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
    return holding ? holding.quantity : 0;
};
