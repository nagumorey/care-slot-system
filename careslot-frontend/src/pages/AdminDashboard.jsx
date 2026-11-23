import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // States para sa forms
  const [newDoctor, setNewDoctor] = useState({ full_name: '', specialization: '', consultation_fee: '' });
  const [newService, setNewService] = useState({ name: '', price: '' });
  
  // STATE PARA SA CHANGE PASSWORD
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const docRes = await axios.get('http://localhost:3000/doctors');
      const serRes = await axios.get('http://localhost:3000/services');
      const appRes = await axios.get('http://localhost:3000/appointments');
      
      setDoctors(docRes.data);
      setServices(serRes.data);
      setAppointments(appRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Functions para mag-add
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/doctors', newDoctor);
      alert('Doctor added successfully!');
      setNewDoctor({ full_name: '', specialization: '', consultation_fee: '' });
      fetchData();
    } catch (error) {
      alert('Error adding doctor');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/services', newService);
      alert('Service added successfully!');
      setNewService({ name: '', price: '' });
      fetchData();
    } catch (error) {
      alert('Error adding service');
    }
  };

  // FUNCTION PARA SA CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.patch(`http://localhost:3000/users/${user.id}/password`, { newPassword });
      alert('Admin password changed successfully!');
      setNewPassword('');
    } catch (error) {
      alert('Error changing password: ' + (error.response?.data?.message || error.message));
    }
  };

  // Function para mag-update ng status
  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:3000/appointments/${id}/status`, { status });
      fetchData();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-sky-100 font-sans">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center border-b-4 border-blue-600 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏥</span>
          <h1 className="text-xl font-bold text-blue-700">CareSlot Admin Panel</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-gray-700">Admin User</span>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors text-sm font-semibold">
            Logout
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Management</h2>
        
        {/* Row 1: Doctor and Service Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Doctor</h3>
            <form onSubmit={handleAddDoctor} className="space-y-3">
              <input type="text" placeholder="Full Name (e.g., Dr. Jose Rizal)" required className="w-full p-2 border rounded"
                value={newDoctor.full_name} onChange={(e) => setNewDoctor({...newDoctor, full_name: e.target.value})} />
              <input type="text" placeholder="Specialization (e.g., Dentist)" required className="w-full p-2 border rounded"
                value={newDoctor.specialization} onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})} />
              <input type="number" placeholder="Consultation Fee" required className="w-full p-2 border rounded"
                value={newDoctor.consultation_fee} onChange={(e) => setNewDoctor({...newDoctor, consultation_fee: e.target.value})} />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full font-semibold">Add Doctor</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Service</h3>
            <form onSubmit={handleAddService} className="space-y-3">
              <input type="text" placeholder="Service Name (e.g., Dental Check-up)" required className="w-full p-2 border rounded"
                value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
              <input type="number" placeholder="Price" required className="w-full p-2 border rounded"
                value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full font-semibold mt-11">Add Service</button>
            </form>
          </div>
        </div>

        {/* Row 2: Change Admin Password Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-500 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Change Admin Password (Settings)</h3>
          <p className="text-sm text-gray-500 mb-4">Use this to update the password for the current Admin account.</p>
          <form onSubmit={handleChangePassword} className="flex items-center space-x-4">
            <input 
              type="password" 
              placeholder="Enter new password" 
              required 
              className="flex-1 p-2 border rounded"
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
            />
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-semibold">
              Update Password
            </button>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold">TOTAL DOCTORS</h3>
            <p className="text-3xl font-bold text-gray-800">{doctors.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-semibold">TOTAL SERVICES</h3>
            <p className="text-3xl font-bold text-gray-800">{services.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-semibold">TOTAL APPOINTMENTS</h3>
            <p className="text-3xl font-bold text-gray-800">{appointments.length}</p>
          </div>
        </div>

        {/* Recent Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Appointments</h3>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3 border-b">ID</th>
                <th className="p-3 border-b">Patient</th>
                <th className="p-3 border-b">Doctor</th>
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{app.id}</td>
                  <td className="p-3 border-b">{app.patient?.full_name || 'N/A'}</td>
                  <td className="p-3 border-b">{app.doctor?.full_name || 'N/A'}</td>
                  <td className="p-3 border-b">{new Date(app.appointment_date).toLocaleDateString()} {app.appointment_time}</td>
                  <td className="p-3 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        app.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    {app.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button onClick={() => handleUpdateStatus(app.id, 'confirmed')} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 font-semibold">
                          Confirm
                        </button>
                        <button onClick={() => handleUpdateStatus(app.id, 'cancelled')} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 font-semibold">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No actions needed</span>
                    )}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}