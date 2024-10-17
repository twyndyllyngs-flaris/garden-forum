// essentials
import React from 'react';
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
