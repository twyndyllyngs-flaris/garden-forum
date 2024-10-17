// App.tsx
import React from 'react';
// import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import '../styling/output.css';

// components
import { LoginForm } from '../components/auth/login-form';

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen">
        <LoginForm />
    </div>
  );
}

export default Login;
