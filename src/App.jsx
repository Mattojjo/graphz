import { TradingProvider } from './context/TradingContext';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <TradingProvider>
      <Dashboard />
    </TradingProvider>
  );
}

export default App;
