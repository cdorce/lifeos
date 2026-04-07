import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create Account</h1>
        <p className="text-center text-gray-600">
          Registration coming soon. <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;