import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SmartApp from './pages/SmartApp';
import OldApp from './OldApp';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/*" element={<SmartApp />} />
        <Route path="/old-app" element={<OldApp />} />
      </Routes>
    </Router>
  );
}
