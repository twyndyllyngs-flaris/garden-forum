// App.tsx
import React from 'react';

// import { Routes, Route } from 'react-router-dom'; // Import Routes and Route

import '../styling/output.css';

// components
import { SignupForm } from '../components/auth/signup-form';

function Signup() {
  return (
    <div className="flex items-center justify-center min-h-screen">
        <SignupForm />
    </div>
  );
}

export default Signup;
