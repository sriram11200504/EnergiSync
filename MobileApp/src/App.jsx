import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ApplianceControl from './pages/ApplianceControl';
import TariffOptimization from './pages/TariffOptimization';
import EnergyInsights from './pages/EnergyInsights';
import CarbonFootprint from './pages/CarbonFootprint';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appliances" element={<ApplianceControl />} />
            <Route path="/tariff" element={<TariffOptimization />} />
            <Route path="/insights" element={<EnergyInsights />} />
            <Route path="/carbon" element={<CarbonFootprint />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
