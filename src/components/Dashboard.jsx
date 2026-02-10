import StockChart from './StockChart';
import StockList from './StockList';
import Portfolio from './Portfolio';
import TradePanel from './TradePanel';
import Notification from './Notification';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white p-4 md:p-5">
            <header className="group text-center mb-8 p-5 bg-white/5 border border-white/10 rounded-xl transition-all duration-300 cursor-default hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                <h1 className="mb-2 text-3xl font-semibold bg-gradient-to-r from-[#8b9dc3] to-[#9b8fb5] bg-clip-text text-transparent transition-colors duration-300 group-hover:from-[#9b8fb5] group-hover:to-[#8b9dc3]">
                    GraphZ Trading Platform
                </h1>
                <p className="text-xs text-zinc-500">Live Market Simulation</p>
            </header>

            <Notification />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[300px_1fr_350px] max-w-[1800px] mx-auto">
                <div className="flex flex-col gap-5">
                    <StockList />
                    <TradePanel />
                </div>

                <div className="flex flex-col gap-5">
                    <StockChart />
                </div>

                <div className="flex flex-col gap-5 lg:col-span-2 xl:col-span-1">
                    <Portfolio />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
