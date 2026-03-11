import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EquipmentControl from './pages/EquipmentControl'; // Changed from ApplianceControl
import TariffOptimization from './pages/TariffOptimization';
import EnergyInsights from './pages/EnergyInsights';
import CarbonFootprint from './pages/CarbonFootprint';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import AIAssistantWidget from './components/AIAssistantWidget';
import { EnergyProvider } from './context/EnergyContext';
import './App.css';

function App() {
  return (
    <EnergyProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/equipment" element={<EquipmentControl />} /> {/* Changed from /appliances */}
              <Route path="/tariff" element={<TariffOptimization />} />
              <Route path="/insights" element={<EnergyInsights />} />
              <Route path="/carbon" element={<CarbonFootprint />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <AIAssistantWidget />
        </div>
      </Router>
    </EnergyProvider>
  );
}

export default App;
