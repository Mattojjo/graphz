import { useState } from 'react';
import { useTradingContext } from '../context/TradingContext';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

const formatPercent = (value) => `${value.toFixed(2)}%`;

const Portfolio = () => {
    const {
        cash,
        holdings,
        stocks,
        buyStock,
        sellStock,
        getPortfolioValue,
        getTotalValue,
        getTotalProfitLoss,
        getTotalProfitLossPercent,
    } = useTradingContext();

    const [quantities, setQuantities] = useState({});

    const portfolioValue = getPortfolioValue();
    const totalValue = getTotalValue();
    const profitLoss = getTotalProfitLoss();
    const profitLossPercent = getTotalProfitLossPercent();

    const getQuantity = (symbol) => quantities[symbol] || 1;

    const updateQuantity = (symbol, value) => {
        const newValue = typeof value === 'number' ? value : parseInt(value) || 1;
        setQuantities(prev => ({ ...prev, [symbol]: Math.max(1, newValue) }));
    };

    const handleTrade = (symbol, isBuy) => {
        const quantity = getQuantity(symbol);
        const success = isBuy ? buyStock(symbol, quantity) : sellStock(symbol, quantity);
        if (success) setQuantities(prev => ({ ...prev, [symbol]: 1 }));
    };

    return (
        <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <h2 className="mb-5 text-base font-medium text-zinc-300">Portfolio</h2>

            <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 mb-7">
                <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                    <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#8b9dc3] to-[#9b8fb5] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="text-[0.7rem] uppercase tracking-[0.08em] text-zinc-500">Total Value</span>
                    <span className="mt-2 text-lg font-medium text-zinc-200 break-words">{formatCurrency(totalValue)}</span>
                </div>

                <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                    <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#8b9dc3] to-[#9b8fb5] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="text-[0.7rem] uppercase tracking-[0.08em] text-zinc-500">Cash</span>
                    <span className="mt-2 text-lg font-medium text-zinc-200 break-words">{formatCurrency(cash)}</span>
                </div>

                <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                    <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#8b9dc3] to-[#9b8fb5] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="text-[0.7rem] uppercase tracking-[0.08em] text-zinc-500">Stocks Value</span>
                    <span className="mt-2 text-lg font-medium text-zinc-200 break-words">{formatCurrency(portfolioValue)}</span>
                </div>

                <div
                    className={`group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 ${
                        profitLoss >= 0
                            ? 'hover:shadow-[0_8px_20px_rgba(95,184,120,0.15)]'
                            : 'hover:shadow-[0_8px_20px_rgba(228,114,111,0.15)]'
                    }`}
                >
                    <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#8b9dc3] to-[#9b8fb5] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="text-[0.7rem] uppercase tracking-[0.08em] text-zinc-500">Profit/Loss</span>
                    <span
                        className={`mt-2 flex flex-wrap items-baseline gap-1 text-lg font-medium break-words ${
                            profitLoss >= 0 ? 'text-[#5fb878]' : 'text-[#e4726f]'
                        }`}
                    >
                        {formatCurrency(profitLoss)}
                        <span className="text-sm text-zinc-300">({formatPercent(profitLossPercent)})</span>
                    </span>
                </div>
            </div>

            <div className="min-w-0">
                <h3 className="mb-3 text-sm font-medium text-zinc-300">Your Holdings</h3>
                {holdings.length === 0 ? (
                    <p className="text-center py-10 px-5 text-zinc-500 italic">No stocks owned yet. Start trading!</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {holdings.map(holding => {
                            const stock = stocks.find(s => s.symbol === holding.symbol);
                            if (!stock) return null;

                            const currentValue = holding.quantity * stock.currentPrice;
                            const investedValue = holding.quantity * holding.averagePrice;
                            const holdingPL = currentValue - investedValue;
                            const holdingPLPercent = (holdingPL / investedValue) * 100;
                            const quantity = getQuantity(holding.symbol);
                            const canAffordBuy = cash >= stock.currentPrice * quantity;
                            const canSell = holding.quantity >= quantity;

                            return (
                                <div
                                    key={holding.symbol}
                                    className="relative overflow-visible rounded-lg border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                                >
                                    <div className="mb-2 flex flex-col gap-0.5">
                                        <span className="text-sm font-semibold text-zinc-200">{holding.symbol}</span>
                                        <span className="text-xs text-zinc-500">{stock.name}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">Quantity</span>
                                            <span className="text-sm text-zinc-200">{holding.quantity}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">Avg Price</span>
                                            <span className="text-sm text-zinc-200">{formatCurrency(holding.averagePrice)}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">Current Price</span>
                                            <span className="text-sm text-zinc-200">{formatCurrency(stock.currentPrice)}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">Value</span>
                                            <span className="text-sm text-zinc-200">{formatCurrency(currentValue)}</span>
                                        </div>
                                        <div className={`flex flex-col gap-0.5 ${holdingPL >= 0 ? 'text-[#5fb878]' : 'text-[#e4726f]'}`}>
                                            <span className="text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">P/L</span>
                                            <span className="text-sm font-medium">
                                                {formatCurrency(holdingPL)} ({formatPercent(holdingPLPercent)})
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center">
                                        <div className="flex flex-col gap-1 text-xs text-zinc-400">
                                            <span className="uppercase tracking-[0.08em] text-[0.65rem] text-zinc-500">Qty</span>
                                            <div className="grid grid-cols-[32px_50px_32px] gap-1.5">
                                                <button
                                                    onClick={() => updateQuantity(holding.symbol, quantity - 1)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm text-white transition-transform duration-300 hover:scale-110 hover:border-white/40 hover:bg-white/20 hover:shadow-[0_2px_8px_rgba(255,255,255,0.1)] active:scale-95"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => updateQuantity(holding.symbol, e.target.value)}
                                                    min="1"
                                                    className="w-12 rounded-md border border-white/20 bg-white/5 px-2 py-1 text-center text-sm font-semibold text-white transition duration-300 hover:border-white/30 hover:bg-white/10 focus:border-[#667eea] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#667eea]/30"
                                                />
                                                <button
                                                    onClick={() => updateQuantity(holding.symbol, quantity + 1)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm text-white transition-transform duration-300 hover:scale-110 hover:border-white/40 hover:bg-white/20 hover:shadow-[0_2px_8px_rgba(255,255,255,0.1)] active:scale-95"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-2">
                                            <button
                                                className="flex-1 rounded-md bg-gradient-to-br from-[#5fb878] to-[#6ec282] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(95,184,120,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
                                                onClick={() => handleTrade(holding.symbol, true)}
                                                disabled={!canAffordBuy}
                                                title={!canAffordBuy ? 'Insufficient funds' : `Buy ${quantity} share${quantity > 1 ? 's' : ''}`}
                                            >
                                                Buy {quantity}
                                            </button>
                                            <button
                                                className="flex-1 rounded-md bg-gradient-to-br from-[#e4726f] to-[#e88683] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(228,114,111,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
                                                onClick={() => handleTrade(holding.symbol, false)}
                                                disabled={!canSell}
                                                title={!canSell ? 'Insufficient shares' : `Sell ${quantity} share${quantity > 1 ? 's' : ''}`}
                                            >
                                                Sell {quantity}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;
