import { Routes, Route } from 'react-router-dom';
import './styling/output.css';

// components
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard';
import Forum from './pages/forum';
import Faq from './pages/faq';
import Profile from './pages/profile';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/guides" element={<Dashboard />} />
      <Route path="/guides/:category/:plant" element={<Dashboard />} />
      <Route path="/forum" element={<Dashboard />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Profile />} />
    </Routes>
  );
}

export default App;
