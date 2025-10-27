import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaHospital, FaTruck, FaFlask } from 'react-icons/fa';

const providerTypes = [
  { name: 'Doctor / Clinic', path: '/signup/provider/doctor', icon: <FaUserMd className="text-4xl mb-3" /> },
  { name: 'Pharmacy / Store', path: '/signup/provider/pharmacy', icon: <FaHospital className="text-4xl mb-3" /> },
  { name: 'Diagnostic Center', path: '/signup/provider/diagnostic', icon: <FaFlask className="text-4xl mb-3" /> },
  { name: 'Delivery Agent', path: '/signup/provider/delivery', icon: <FaTruck className="text-4xl mb-3" /> },
];

const ProviderHub = () => {
  return (
    <main className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-2xl w-full px-6">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-[#009cfb] mb-2">Sign up as Provider</h1>
          <p className="text-sm text-slate-500 mb-8">Choose your provider category to get started.</p>

          <div className="grid grid-cols-2 gap-4">
            {providerTypes.map((type) => (
              <Link
                key={type.name}
                to={type.path}
                className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg text-slate-800 hover:bg-slate-200 transition-colors"
              >
                {type.icon}
                <span className="font-semibold text-center">{type.name}</span>
              </Link>
            ))}
          </div>

           <div className="mt-8 text-center text-slate-700">
            <p className="text-sm">
              Already have an account?{' '}
              <Link to="/login/provider" className="text-blue-600 hover:underline">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProviderHub;