import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> {/* Verify this line exists */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;