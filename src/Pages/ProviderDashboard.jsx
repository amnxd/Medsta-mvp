import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/Stores/authStore.js';
import { FaHome, FaShoppingBag, FaListUl, FaChartLine } from 'react-icons/fa';

const menu = [
  { id: 'overview', label: 'Overview', icon: FaHome },
  { id: 'your-orders', label: 'Your Orders', icon: FaShoppingBag },
  { id: 'available-orders', label: 'Available Orders', icon: FaListUl },
  { id: 'analytics', label: 'Analytics', icon: FaChartLine },
];

const ProviderDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [active, setActive] = useState('overview'); // overview selected by default
  const name = (user?.displayName || user?.email || 'Provider').split('@')[0];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-3">
            <div className="sticky top-24 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-4 border-b">
                <img src="/Images/logo.svg" alt="Medsta" className="h-8 w-8" onError={(e)=>{e.currentTarget.src='/Images/logo.png'}} />
                <div>
                  <p className="text-lg font-bold leading-tight">Medsta</p>
                  <p className="text-xs text-gray-500 -mt-1">Provider Console</p>
                </div>
              </div>
              <nav className="py-2">
                {menu.map((m) => {
                  const Icon = m.icon;
                  const selected = active === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActive(m.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                        selected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={selected ? 'text-blue-700' : 'text-gray-400'} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="col-span-12 md:col-span-9 lg:col-span-9">
            {active === 'overview' && (
              <section className="space-y-6">
                {/* Greeting */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {name} 👋</h1>
                  <p className="text-gray-600 mt-1">Here’s a quick snapshot of your activity today.</p>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[{t:'New Orders',v:0},{t:'Completed',v:0},{t:'Earnings (₹)',v:0}].map((c,idx)=>(
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
                      <p className="text-sm text-gray-500">{c.t}</p>
                      <p className="mt-2 text-3xl font-extrabold text-gray-900">{c.v}</p>
                    </div>
                  ))}
                </div>

                {/* Shortcuts */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={()=>setActive('available-orders')} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">View available orders</button>
                    <Link to="/provider-dashboard" className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200">Refresh</Link>
                  </div>
                </div>
              </section>
            )}

            {active === 'your-orders' && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold">Your Orders</h2>
                <p className="text-gray-600 mt-1">No orders assigned yet.</p>
              </section>
            )}

            {active === 'available-orders' && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold">Available Orders</h2>
                <p className="text-gray-600 mt-1">There are no available orders right now.</p>
              </section>
            )}

            {active === 'analytics' && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold">Analytics</h2>
                <p className="text-gray-600 mt-1">Traffic and earnings analytics will appear here.</p>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;

