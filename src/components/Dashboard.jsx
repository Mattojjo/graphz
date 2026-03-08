import React from 'react';
import { useState } from 'react';
import StockChart from './StockChart';
import StockList from './StockList';
import Portfolio from './Portfolio';
import TradePanel from './TradePanel';
import Notification from './Notification';
import Card from './ui/Card';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';

const Dashboard = () => {
    const [showPortfolio, setShowPortfolio] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { ui } = useUI();

    const gridCols = showPortfolio
        ? 'xl:grid-cols-[300px_1fr_350px]'
        : 'xl:grid-cols-[300px_1fr]';

    return (
        <div className="min-h-screen p-4 md:p-5" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
            <header className="relative group text-center mb-8 p-5 rounded-xl transition-all duration-300 cursor-default">
                <div className="absolute right-4 top-4 flex items-center gap-2">
                    <button
                        onClick={() => setShowPortfolio(prev => !prev)}
                        className="h-9 rounded-lg border border-green-500 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] transition-all duration-200"
                        aria-label={showPortfolio ? 'Collapse portfolio panel' : 'Expand portfolio panel'}
                    >
                        {showPortfolio ? 'Hide Portfolio' : 'Show Portfolio'}
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="h-9 rounded-lg border border-green-500 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] transition-all duration-200"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                </div>

                <h1 className="mb-2 text-3xl font-semibold">
                    GraphZ Trading Platform
                </h1>
                <p className="text-xs muted">Live Market Simulation</p>
            </header>

            <Notification />

            <div className={`grid grid-cols-1 gap-5 lg:grid-cols-2 ${gridCols} max-w-[1800px] mx-auto`}>
                <div className="flex flex-col gap-5">
                    <Card><StockList /></Card>
                    <Card><TradePanel /></Card>
                </div>

                <div className="flex flex-col gap-5">
                    <Card><StockChart /></Card>
                </div>

                <div className={`flex flex-col gap-5 lg:col-span-2 xl:col-span-1 transition-all duration-500 ${showPortfolio ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'}`}>
                    {showPortfolio && <Card><Portfolio /></Card>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
