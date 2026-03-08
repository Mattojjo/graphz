import { TradingProvider } from './context/TradingContext';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <UIProvider>
        <TradingProvider>
          <Dashboard />
        </TradingProvider>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;
