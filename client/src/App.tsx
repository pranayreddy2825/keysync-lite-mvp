import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import WhatsAppDemo from './pages/WhatsAppDemo';
import GmailDemo from './pages/GmailDemo';
import BackendProcess from './pages/BackendProcess';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/whatsapp" element={<WhatsAppDemo />} />
          <Route path="/gmail" element={<GmailDemo />} />
          <Route path="/backend" element={<BackendProcess />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
