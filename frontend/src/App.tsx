import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/Web3Context';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import Admin from './pages/Admin/Admin';
import Dashboard from './pages/Dashboard/Dashboard';
import Issuer from './pages/Issuer/Issuer';
import Marketplace from './pages/Marketplace/Marketplace';
import Assets from './pages/Assets/Assets';
import Transactions from './pages/Transactions/Transactions';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/issuer" element={<Issuer />} />
          </Routes>
        </AuthProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
