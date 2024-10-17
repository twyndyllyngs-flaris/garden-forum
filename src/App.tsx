// App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import './styling/output.css';

// components
import Login from './pages/login';
import Signup from './pages/signup';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} /> 
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
