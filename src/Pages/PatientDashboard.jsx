import React, { useEffect, useState } from 'react';
import { db } from '@/Services/firebase.js';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/Stores/authStore.js';
import { useLocationStore } from '@/Stores/locationStore.js';
import { FaRegCalendarAlt, FaPills, FaFlask, FaAmbulance, FaRobot, FaFileAlt, FaDownload, FaShoppingCart } from 'react-icons/fa';

const PatientDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'appointments' | 'orders' | 'lab-tests' | 'reports' | 'cart'
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const initLocation = useLocationStore((s) => s.initFromStorage);

  useEffect(() => {
    // Load saved location and then ask permission once on dashboard mount
    initLocation();
    requestLocation();
  }, [initLocation, requestLocation]);

  const firstName = (user?.displayName || user?.email || 'there').split(' ')[0].split('@')[0];

  const formatDateTime = (ts) => {
    if (!ts) return '';
    try {
      const d = ts instanceof Date ? ts : new Date(ts.seconds ? ts.seconds * 1000 : ts);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '';
    }
  };

    // Firestore-driven data
    const [labUpcoming, setLabUpcoming] = useState([]);
    const [labUpcomingLast, setLabUpcomingLast] = useState(null);
    const [reportsData, setReportsData] = useState([]);
    const [reportsLast, setReportsLast] = useState(null);
    const [cartItems, setCartItems] = useState([]);

    // Seed minimal sample data for the logged-in user if collections are empty
    useEffect(() => {
      if (!user?.uid) return;
      (async () => {
        // Lab tests
        const labQ = query(
          collection(db, 'patient_lab_tests'),
          where('userId', '==', user.uid),
          limit(1)
        );
        const labSnap = await getDocs(labQ);
        if (labSnap.empty) {
          const future = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)); // +14 days
          const past = Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)); // -30 days
          await addDoc(collection(db, 'patient_lab_tests'), {
            userId: user.uid,
            name: 'Complete Blood Count (CBC)',
            mode: 'At-Center',
            center: 'City Central Imaging',
            scheduledAt: future,
          });
          await addDoc(collection(db, 'patient_lab_tests'), {
            userId: user.uid,
            name: 'Thyroid Profile',
            mode: 'At-Home',
            center: 'Valley Path Labs',
            scheduledAt: past,
          });
        }

        // Reports
        const repQ = query(collection(db, 'patient_reports'), where('userId', '==', user.uid), limit(1));
        const repSnap = await getDocs(repQ);
        if (repSnap.empty) {
          await addDoc(collection(db, 'patient_reports'), {
            userId: user.uid,
            title: 'Lipid Profile Report',
            from: 'Valley Path Labs',
            date: Timestamp.fromDate(new Date('2024-07-10')),
            fileUrl: 'https://example.com/lipid-profile.pdf',
          });
          await addDoc(collection(db, 'patient_reports'), {
            userId: user.uid,
            title: 'Chest X-Ray Analysis',
            from: 'City Central Imaging',
            date: Timestamp.fromDate(new Date('2024-06-25')),
            fileUrl: 'https://example.com/chest-xray.pdf',
          });
        }

        // Cart
        const cartRef = doc(db, 'patient_carts', user.uid);
        const cartDoc = await getDoc(cartRef);
        if (!cartDoc.exists()) {
          await setDoc(cartRef, {
            items: [
              { id: 'med-1', name: 'Paracetamol 500mg', qty: 2, price: 25, pharmacy: 'City Pharmacy' },
              { id: 'med-2', name: 'Cough Syrup 100ml', qty: 1, price: 120, pharmacy: 'HealthPlus Store' },
            ],
            updatedAt: Timestamp.now(),
          });
        }
      })();
    }, [user?.uid]);

    // Fetchers
    useEffect(() => {
      if (!user?.uid) return;
      (async () => {
        const nowTs = Timestamp.fromDate(new Date());
        const qUpcoming = query(
          collection(db, 'patient_lab_tests'),
          where('userId', '==', user.uid),
          where('scheduledAt', '>=', nowTs),
          orderBy('scheduledAt', 'asc'),
          limit(5)
        );
        const snap = await getDocs(qUpcoming);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLabUpcoming(items);
        setLabUpcomingLast(snap.docs[snap.docs.length - 1] || null);

        const qReports = query(
          collection(db, 'patient_reports'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(5)
        );
        const rSnap = await getDocs(qReports);
        setReportsData(rSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setReportsLast(rSnap.docs[rSnap.docs.length - 1] || null);

        const cartRef = doc(db, 'patient_carts', user.uid);
        const cDoc = await getDoc(cartRef);
        setCartItems(cDoc.exists() ? cDoc.data().items || [] : []);
      })();
    }, [user?.uid]);

    const loadMoreUpcoming = async () => {
      if (!user?.uid || !labUpcomingLast) return;
      const nowTs = Timestamp.fromDate(new Date());
      const qMore = query(
        collection(db, 'patient_lab_tests'),
        where('userId', '==', user.uid),
        where('scheduledAt', '>=', nowTs),
        orderBy('scheduledAt', 'asc'),
        startAfter(labUpcomingLast),
        limit(5)
      );
      const snap = await getDocs(qMore);
      setLabUpcoming((prev) => [...prev, ...snap.docs.map((d) => ({ id: d.id, ...d.data() }))]);
      setLabUpcomingLast(snap.docs[snap.docs.length - 1] || null);
    };

    const loadMoreReports = async () => {
      if (!user?.uid || !reportsLast) return;
      const qMore = query(
        collection(db, 'patient_reports'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        startAfter(reportsLast),
        limit(5)
      );
      const snap = await getDocs(qMore);
      setReportsData((prev) => [...prev, ...snap.docs.map((d) => ({ id: d.id, ...d.data() }))]);
      setReportsLast(snap.docs[snap.docs.length - 1] || null);
    };

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
            <ul className="flex gap-3 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'appointments', label: 'Appointments' },
                { id: 'orders', label: 'Orders' },
                { id: 'lab-tests', label: 'Lab Tests' },
                { id: 'reports', label: 'Reports' },
                { id: 'cart', label: 'Cart' },
              ].map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={
                      activeTab === tab.id
                        ? 'px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-blue-50 text-blue-700 font-semibold'
                        : 'px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                    }
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Tab panels */}
        {activeTab === 'overview' && (
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
        )}

        {activeTab === 'appointments' && (
          <section className="mt-6 bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Your Appointments</h2>
            <p className="mt-1 text-gray-600">Manage your upcoming and view past appointments.</p>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
              <p className="mt-2 text-gray-600">No upcoming appointments.</p>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900">Past</h3>
              <p className="mt-2 text-gray-600">No past appointments.</p>
            </div>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="mt-6 bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Medicine Orders</h2>
            <p className="mt-1 text-gray-600">Track your recent medicine deliveries.</p>

            <div className="mt-6">
              <p className="text-gray-600">You have no active orders.</p>
            </div>
          </section>
        )}

        {activeTab === 'lab-tests' && (
          <section className="mt-6 bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Diagnostic Tests</h2>
            <p className="mt-1 text-gray-600">View your scheduled tests.</p>

            <div className="mt-6 space-y-4">
              {labUpcoming.length === 0 && (
                <p className="text-gray-600">No upcoming tests scheduled.</p>
              )}
              {labUpcoming.map((t) => (
                <article key={t.id} className="border rounded-lg p-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">At: {t.center}</p>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <FaRegCalendarAlt className="text-gray-400" /> {formatDateTime(t.scheduledAt)}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full h-fit">{t.mode}</span>
                </article>
              ))}
            </div>
            {labUpcomingLast && labUpcoming.length >= 5 && (
              <div className="mt-4">
                <button onClick={loadMoreUpcoming} type="button" className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Load more</button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'reports' && (
          <section className="mt-6 bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Your Medical Reports</h2>
            <p className="mt-1 text-gray-600">Access and download your reports and prescriptions.</p>

            <div className="mt-6 space-y-6">
              {reportsData.length === 0 && (
                <p className="text-gray-600">No reports available yet.</p>
              )}
              {reportsData.map((r) => (
                <div key={r.id} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FaFileAlt className="text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <p className="text-sm text-gray-600">From: {r.from} - {formatDateTime(r.date)}</p>
                    </div>
                  </div>
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md inline-flex items-center gap-2">
                    <FaDownload /> Download
                  </a>
                </div>
              ))}
            </div>
            {reportsLast && reportsData.length >= 5 && (
              <div className="mt-4">
                <button onClick={loadMoreReports} type="button" className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Load more</button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'cart' && (
          <section className="mt-6 bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><FaShoppingCart /> Your Cart</h2>
            <p className="mt-1 text-gray-600">Items you've added from pharmacies.</p>

            {cartItems.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <FaShoppingCart className="text-5xl text-gray-400" />
                <p className="mt-4 text-gray-600">Your cart is empty.</p>
                <Link to="/medicine-ordering" className="mt-2 text-blue-600 hover:underline">Start Shopping</Link>
              </div>
            ) : (
              <div className="mt-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-700">
                        <th className="py-2 pr-4">Item</th>
                        <th className="py-2 pr-4">Pharmacy</th>
                        <th className="py-2 pr-4">Qty</th>
                        <th className="py-2 pr-4">Price</th>
                        <th className="py-2 pr-4">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((it) => (
                        <tr key={it.id} className="border-t">
                          <td className="py-2 pr-4 text-gray-900 font-medium">{it.name}</td>
                          <td className="py-2 pr-4 text-gray-600">{it.pharmacy}</td>
                          <td className="py-2 pr-4">{it.qty}</td>
                          <td className="py-2 pr-4">₹{it.price}</td>
                          <td className="py-2 pr-4">₹{it.qty * it.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-900">
                    Total: ₹{cartItems.reduce((sum, it) => sum + (Number(it.qty) * Number(it.price)), 0)}
                  </p>
                  <Link to="/cart" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium">Go to Cart</Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Providers banner - show on overview tab to avoid clutter */}
        {activeTab === 'overview' && (
        <section className="mt-10 bg-white rounded-2xl shadow-sm p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Medsta for Providers</h2>
          <p className="mt-2 text-gray-600">Join our network and grow with us.</p>
        </section>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;

