import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/Stores/authStore.js';
import { useLocationStore } from '@/Stores/locationStore.js';
import { FaRegCalendarAlt, FaPills, FaFlask, FaAmbulance, FaRobot } from 'react-icons/fa';

const PatientDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const initLocation = useLocationStore((s) => s.initFromStorage);

  useEffect(() => {
    // Load saved location and then ask permission once on dashboard mount
    initLocation();
    requestLocation();
  }, [initLocation, requestLocation]);

  const firstName = (user?.displayName || user?.email || 'there').split(' ')[0].split('@')[0];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero / Greeting */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-3 text-gray-600">Here's a summary of your health journey.</p>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/book-appointment" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                <FaRegCalendarAlt /> Book Appointment
              </Link>
              <Link to="/medicine-ordering" className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-200 transition">
                <FaPills /> Order Medicines
              </Link>
              <Link to="/diagnostic-tests" className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-200 transition">
                <FaFlask /> Book Lab Test
              </Link>
              <Link to="/multivendor-workplace" className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-200 transition">
                <FaAmbulance /> Book Transport
              </Link>
              <Link to="/about" className="sm:col-span-2 mt-1 flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-3 rounded-lg font-medium hover:bg-indigo-200 transition">
                <FaRobot /> Medsta-AI
              </Link>
            </div>
          </div>
          {/* Hero image placeholder */}
          <div className="relative bg-linear-to-br from-sky-200 via-blue-200 to-indigo-200">
            <img
              src="/Images/hero-bubbles.jpg"
              alt=""
              className="w-full h-full object-cover opacity-80 hidden md:block"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </section>

        {/* Tabs */}
        <div className="mt-6">
          <nav className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <ul className="flex gap-6 px-6 py-3 text-sm sm:text-base">
              <li className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Overview</li>
              <li className="text-gray-500">Appointments</li>
              <li className="text-gray-500">Orders</li>
              <li className="text-gray-500">Lab Tests</li>
              <li className="text-gray-500">Reports</li>
              <li className="text-gray-500">Cart</li>
            </ul>
          </nav>
        </div>

        {/* Overview tiles */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments */}
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[180px]">
            <FaRegCalendarAlt className="text-3xl text-gray-400" />
            <p className="mt-3 text-gray-600">No upcoming appointments.</p>
            <Link to="/book-appointment" className="mt-2 text-blue-600 font-medium hover:underline">Book one now</Link>
          </div>
          {/* Orders */}
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[180px]">
            <FaPills className="text-3xl text-gray-400" />
            <p className="mt-3 text-gray-600">No active medicine orders.</p>
            <Link to="/medicine-ordering" className="mt-2 text-blue-600 font-medium hover:underline">Order now</Link>
          </div>
          {/* Upcoming test card */}
          <aside className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="inline-block w-5 h-0.5 bg-blue-600 mr-1" /> Upcoming Test
            </h3>
            <div className="mt-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">Complete Blood Count (CBC)</p>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">At-Center</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">At: City Central Imaging</p>
              <p className="text-sm text-gray-600 mt-2">2024-08-18 at 9:00 AM</p>
            </div>
          </aside>
        </div>

        {/* Providers banner */}
        <section className="mt-10 bg-white rounded-2xl shadow-sm p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Medsta for Providers</h2>
          <p className="mt-2 text-gray-600">Join our network and grow with us.</p>
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;

