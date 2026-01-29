import StockChart from './StockChart';
import StockList from './StockList';
import Portfolio from './Portfolio';
import TradePanel from './TradePanel';
import Notification from './Notification';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>📈 GraphZ Trading Platform</h1>
                <p className="tagline">Live Market Simulation</p>
            </header>

            <Notification />

            <div className="dashboard-grid">
                <div className="left-panel">
                    <StockList />
                    <TradePanel />
                </div>

                <div className="center-panel">
                    <StockChart />
                </div>

                <div className="right-panel">
                    <Portfolio />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
