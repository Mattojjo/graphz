import React from 'react';
import { useTradingContext } from '../context/TradingContext';
import { formatCurrency, formatSignedPercent } from '../utils/format';

const StockList = () => {
    const { stocks, selectedStock, setSelectedStock } = useTradingContext();

    return (
        <div className="max-h-[500px] overflow-y-auto hide-scrollbar transition-all duration-300">
            <h2 className="sticky top-0 z-10 mb-5 pb-2 text-base font-medium muted">Stock Market</h2>
            <div className="flex flex-col gap-2.5">
                {stocks.map(stock => {
                    const isSelected = selectedStock?.symbol === stock.symbol;
                    const isPositive = stock.changePercent >= 0;
                    const itemClasses = [
                        'relative bg-white/5 p-3 rounded-lg border border-green-300 cursor-pointer transition-colors duration-200',
                        'hover:bg-white/10 hover:border-white/30',
                        isSelected
                            ? 'bg-[rgba(102,126,234,0.2)] border-[#667eea] shadow-[0_4px_16px_rgba(102,126,234,0.3)] hover:bg-[rgba(102,126,234,0.3)] hover:border-[#764ba2]'
                            : '',
                    ]
                        .filter(Boolean)
                        .join(' ');

                    return (
                        <div
                            key={stock.symbol}
                            className={itemClasses}
                            onClick={() => setSelectedStock(stock)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="text-sm font-semibold text-zinc-200">{stock.symbol}</div>
                                    <div className="mt-0.5 text-[0.7rem] text-zinc-500">{stock.name}</div>
                                </div>
                                <div
                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                        isPositive
                                            ? 'text-[#5fb878] bg-[rgba(95,184,120,0.12)]'
                                            : 'text-[#e4726f] bg-[rgba(228,114,111,0.12)]'
                                    }`}
                                >
                                    {formatSignedPercent(stock.changePercent)}
                                </div>
                            </div>
                            <div className="text-base font-medium text-zinc-200">
                                {formatCurrency(stock.currentPrice)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StockList;
