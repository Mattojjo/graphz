import { useState } from 'react';
import { useTradingContext } from '../context/TradingContext';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

const TradePanel = () => {
    const { selectedStock, cash, buyStock, sellStock, getHoldingQuantity } = useTradingContext();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('buy');

    if (!selectedStock) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <p className="text-center py-10 px-5 text-zinc-500 italic">Select a stock to trade</p>
            </div>
        );
    }

    const currentHolding = getHoldingQuantity(selectedStock.symbol);
    const totalCost = selectedStock.currentPrice * quantity;
    const canAfford = cash >= totalCost;
    const canSell = currentHolding >= quantity;

    const handleTrade = () => {
        const success = activeTab === 'buy'
            ? buyStock(selectedStock.symbol, quantity)
            : sellStock(selectedStock.symbol, quantity);
        if (success) setQuantity(1);
    };

    const updateQuantity = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleQuantityChange = (e) => {
        setQuantity(Math.max(1, parseInt(e.target.value) || 1));
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <h2 className="mb-5 text-base font-medium text-zinc-300">Trade {selectedStock.symbol}</h2>
            <div className="mb-5 rounded-lg bg-white/5 p-4">
                <div className="flex items-center justify-between py-2 text-sm text-zinc-400">
                    <span>Current Price:</span>
                    <span className="text-base font-medium text-zinc-200">{formatCurrency(selectedStock.currentPrice)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm text-zinc-400">
                    <span>Owned:</span>
                    <span>{currentHolding} shares</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
                <button
                    className={`relative overflow-hidden rounded-lg border-2 border-white/10 bg-white/5 p-2.5 text-sm font-medium text-zinc-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${
                        activeTab === 'buy'
                            ? 'bg-[rgba(139,157,195,0.2)] border-[#8b9dc3] shadow-[0_4px_12px_rgba(139,157,195,0.2)]'
                            : ''
                    }`}
                    onClick={() => setActiveTab('buy')}
                >
                    Buy
                </button>
                <button
                    className={`relative overflow-hidden rounded-lg border-2 border-white/10 bg-white/5 p-2.5 text-sm font-medium text-zinc-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${
                        activeTab === 'sell'
                            ? 'bg-[rgba(139,157,195,0.2)] border-[#8b9dc3] shadow-[0_4px_12px_rgba(139,157,195,0.2)]'
                            : ''
                    }`}
                    onClick={() => setActiveTab('sell')}
                >
                    Sell
                </button>
            </div>

            <div className="flex flex-col gap-5">
                <div className="w-full">
                    <label className="mb-2 block text-sm uppercase tracking-[0.05em] text-zinc-300">Quantity</label>
                    <div className="grid grid-cols-[40px_1fr_40px] gap-2">
                        <button onClick={() => updateQuantity(-1)} className="min-w-[40px] rounded-lg border border-white/20 bg-white/10 p-2 text-xl text-white transition-transform duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/20 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)] active:scale-95">
                            -
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min="1"
                            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm font-medium text-center text-zinc-200 transition duration-300 hover:border-white/30 hover:bg-white/10 focus:border-[#8b9dc3] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#8b9dc3]/40"
                        />
                        <button onClick={() => updateQuantity(1)} className="min-w-[40px] rounded-lg border border-white/20 bg-white/10 p-2 text-xl text-white transition-transform duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/20 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)] active:scale-95">
                            +
                        </button>
                    </div>
                </div>

                <div className="rounded-lg bg-white/5 p-4">
                    <div className="flex items-center justify-between py-2 text-sm text-zinc-400">
                        <span>Total:</span>
                        <span className="text-lg font-medium text-zinc-200">{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 text-sm text-zinc-400">
                        <span>{activeTab === 'buy' ? 'Available Cash:' : 'Owned Shares:'}</span>
                        <span className={(activeTab === 'buy' ? canAfford : canSell) ? '' : 'text-[#e4726f] font-medium'}>
                            {activeTab === 'buy' ? formatCurrency(cash) : currentHolding}
                        </span>
                    </div>
                </div>

                <button
                    className={`relative overflow-hidden rounded-lg p-3.5 text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                        activeTab === 'buy'
                            ? 'bg-gradient-to-br from-[#5fb878] to-[#6ec282] text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(95,184,120,0.25)]'
                            : 'bg-gradient-to-br from-[#e4726f] to-[#e88683] text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(228,114,111,0.25)]'
                    }`}
                    onClick={handleTrade}
                    disabled={activeTab === 'buy' ? !canAfford : !canSell}
                >
                    {activeTab === 'buy'
                        ? (canAfford ? `Buy ${quantity} Share${quantity > 1 ? 's' : ''}` : 'Insufficient Funds')
                        : (canSell ? `Sell ${quantity} Share${quantity > 1 ? 's' : ''}` : 'Insufficient Shares')}
                </button>
            </div>
        </div>
    );
};

export default TradePanel;
