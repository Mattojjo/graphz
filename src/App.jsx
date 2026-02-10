import { TradingProvider } from './context/TradingContext';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <TradingProvider>
      <Dashboard />
    </TradingProvider>
  );
}

export default App;
