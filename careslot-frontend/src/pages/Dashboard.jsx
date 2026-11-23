import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  
  // States para sa Form
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    service_id: '',
    appointment_date: '',
    appointment_time: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !storedUser) {
      navigate('/');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchAppointments(parsedUser.id);
      fetchFormData();
    }
  }, [navigate]);

  const fetchAppointments = async (patientId) => {
    try {
      const res = await axios.get('http://localhost:3000/appointments');
      const myApps = res.data.filter(app => app.patient_id === patientId);
      setAppointments(myApps);
    } catch (error) {
      console.error("Error fetching appointments", error);
    }
  };

  const fetchFormData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/appointments/form-data');
      setDoctors(res.data.doctors);
      setServices(res.data.services);
    } catch (error) {
      console.error("Error fetching form data", error);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/appointments', {
        ...formData,
        patient_id: user.id,
      });
      alert('Appointment Booked Successfully!');
      setShowBooking(false);
      setFormData({ doctor_id: '', service_id: '', appointment_date: '', appointment_time: '' });
      fetchAppointments(user.id); // I-refresh ang listahan
    } catch (error) {
      alert('Booking Failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-sky-100 font-sans">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center border-b-4 border-blue-600 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏥</span>
          <h1 className="text-xl font-bold text-blue-700">CareSlot Patient</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{user.full_name || user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors text-sm font-semibold">
            Logout
          </button>
        </div>
      </nav>
      
      <main className="p-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white mb-8 shadow-md flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Hello, {user.full_name ? user.full_name.split(' ')[0] : 'Patient'}! 👋</h2>
            <p className="text-blue-100">Welcome to your health portal. How can we help you today?</p>
          </div>
          <button 
            onClick={() => setShowBooking(!showBooking)}
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-bold shadow hover:bg-gray-50 transition-colors"
          >
            {showBooking ? 'Cancel Booking' : '+ Book Appointment'}
          </button>
        </div>

        {/* Booking Form */}
        {showBooking && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Book a New Appointment</h3>
            <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select Doctor</label>
                <select required className="w-full p-2 border rounded-md" 
                  value={formData.doctor_id} onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}>
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.full_name} ({doc.specialization})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select Service</label>
                <select required className="w-full p-2 border rounded-md"
                  value={formData.service_id} onChange={(e) => setFormData({...formData, service_id: e.target.value})}>
                  <option value="">-- Choose Service --</option>
                  {services.map(ser => (
                    <option key={ser.id} value={ser.id}>{ser.name} - ₱{ser.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input required type="date" className="w-full p-2 border rounded-md" 
                  value={formData.appointment_date} onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Time</label>
                <input required type="time" className="w-full p-2 border rounded-md" 
                  value={formData.appointment_time} onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}/>
              </div>
              <div className="md:col-span-2 mt-2">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full md:w-auto font-semibold">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appointments List */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            📅 My Appointments
          </h3>
          {appointments.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
              <p className="text-gray-500 text-lg mb-2">No appointments yet.</p>
              <p className="text-gray-400 text-sm">Click the "Book Appointment" button above to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map(app => (
                <div key={app.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{app.doctor?.full_name || 'Doctor'}</p>
                    <p className="text-sm text-gray-500 mb-1">{app.service?.name || 'Service'}</p>
                    <p className="text-sm font-semibold text-blue-600">
                      📅 {new Date(app.appointment_date).toLocaleDateString()} at {app.appointment_time}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                      'bg-gray-100 text-gray-700'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}