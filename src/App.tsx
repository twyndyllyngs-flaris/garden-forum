// App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import './styling/output.css';

// components
import Login from './pages/login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} /> {/* Define your Home route */}
    </Routes>
  );
}

export default App;
