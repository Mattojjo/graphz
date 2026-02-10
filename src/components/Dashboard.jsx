import { useState } from 'react';
import StockChart from './StockChart';
import StockList from './StockList';
import Portfolio from './Portfolio';
import TradePanel from './TradePanel';
import Notification from './Notification';

const Dashboard = () => {
    const [showPortfolio, setShowPortfolio] = useState(false);

    const gridCols = showPortfolio
        ? 'xl:grid-cols-[300px_1fr_350px]'
        : 'xl:grid-cols-[300px_1fr]';

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white p-4 md:p-5">
            <header className="relative group text-center mb-8 p-5 bg-white/5 border border-white/10 rounded-xl transition-all duration-300 cursor-default hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                <button
                    onClick={() => setShowPortfolio(prev => !prev)}
                    className="h-10 absolute right-4 top-7 rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-zinc-200 transition-all duration-200 hover:border-white/30 hover:bg-white/10"
                    aria-label={showPortfolio ? 'Collapse portfolio panel' : 'Expand portfolio panel'}
                >
                    {showPortfolio ? 'Hide Portfolio' : 'Show Portfolio'}
                </button>
                <h1 className="mb-2 text-3xl font-semibold bg-gradient-to-r from-[#8b9dc3] to-[#9b8fb5] bg-clip-text text-transparent transition-colors duration-300 group-hover:from-[#9b8fb5] group-hover:to-[#8b9dc3]">
                    GraphZ Trading Platform
                </h1>
                <p className="text-xs text-zinc-500">Live Market Simulation</p>
            </header>

            <Notification />

            <div className={`grid grid-cols-1 gap-5 lg:grid-cols-2 ${gridCols} max-w-[1800px] mx-auto`}>
                <div className="flex flex-col gap-5">
                    <StockList />
                    <TradePanel />
                </div>

                <div className="flex flex-col gap-5">
                    <StockChart />
                </div>

                {showPortfolio && (
                    <div className="flex flex-col gap-5 lg:col-span-2 xl:col-span-1">
                        <Portfolio />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
