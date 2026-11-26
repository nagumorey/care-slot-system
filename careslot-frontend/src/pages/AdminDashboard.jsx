import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [medicalFiles, setMedicalFiles] = useState([]);
  const [popupNotif, setPopupNotif] = useState(null);

  // States para sa add forms
  const [newDoctor, setNewDoctor] = useState({ full_name: '', specialization: '', consultation_fee: '' });
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [newSchedule, setNewSchedule] = useState({
    doctor_id: '',
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '17:00',
  });
  const [newPassword, setNewPassword] = useState('');

  // States para sa editing doctors
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editDoctorData, setEditDoctorData] = useState({ full_name: '', specialization: '', consultation_fee: '' });

  // States para sa editing services
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editServiceData, setEditServiceData] = useState({ name: '', price: '' });

  const knownNotifIdsRef = useRef(new Set());
  const isFirstNotifLoadRef = useRef(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const targetUserId = storedUser.id || 1;
      const res = await axios.get(`${API_URL}/notifications`, {
        params: { userId: targetUserId },
      });
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);

      if (isFirstNotifLoadRef.current) {
        list.forEach((n) => knownNotifIdsRef.current.add(n.id));
        isFirstNotifLoadRef.current = false;
        return;
      }

      const brandNew = list.find((n) => !knownNotifIdsRef.current.has(n.id));
      list.forEach((n) => knownNotifIdsRef.current.add(n.id));

      if (brandNew) {
        setPopupNotif(brandNew);
      }
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  const fetchData = async () => {
    try {
      const [docRes, serRes, appRes, schedRes, fileRes] = await Promise.all([
        axios.get(`${API_URL}/doctors`),
        axios.get(`${API_URL}/services`),
        axios.get(`${API_URL}/appointments`),
        axios.get(`${API_URL}/schedules`),
        axios.get(`${API_URL}/medical-files`),
      ]);

      setDoctors(docRes.data || []);
      setServices(serRes.data || []);
      setAppointments(appRes.data || []);
      setSchedules(schedRes.data || []);
      setMedicalFiles(fileRes.data || []);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
      axios
        .get(`${API_URL}/appointments`)
        .then((res) => setAppointments(res.data || []))
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // --- DOCTORS CRUD ---
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/doctors`, {
        ...newDoctor,
        consultation_fee: Number(newDoctor.consultation_fee),
      });
      alert('Doctor added successfully!');
      setNewDoctor({ full_name: '', specialization: '', consultation_fee: '' });
      fetchData();
    } catch (error) {
      alert('Error adding doctor');
    }
  };

  const startEditDoctor = (doc) => {
    setEditingDoctorId(doc.id);
    setEditDoctorData({
      full_name: doc.full_name,
      specialization: doc.specialization,
      consultation_fee: doc.consultation_fee,
    });
  };

  const handleUpdateDoctor = async (id) => {
    try {
      await axios.patch(`${API_URL}/doctors/${id}`, {
        ...editDoctorData,
        consultation_fee: Number(editDoctorData.consultation_fee),
      });
      alert('Doctor updated successfully!');
      setEditingDoctorId(null);
      fetchData();
    } catch (error) {
      alert('Error updating doctor: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!window.confirm(`Delete Dr. ${name}?`)) return;
    try {
      await axios.delete(`${API_URL}/doctors/${id}`);
      alert('Doctor deleted successfully!');
      fetchData();
    } catch (error) {
      alert('Error deleting doctor: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- SERVICES CRUD ---
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/services`, {
        ...newService,
        price: Number(newService.price),
      });
      alert('Service added successfully!');
      setNewService({ name: '', price: '' });
      fetchData();
    } catch (error) {
      alert('Error adding service');
    }
  };

  const startEditService = (ser) => {
    setEditingServiceId(ser.id);
    setEditServiceData({
      name: ser.name,
      price: ser.price,
    });
  };

  const handleUpdateService = async (id) => {
    try {
      await axios.patch(`${API_URL}/services/${id}`, {
        ...editServiceData,
        price: Number(editServiceData.price),
      });
      alert('Service updated successfully!');
      setEditingServiceId(null);
      fetchData();
    } catch (error) {
      alert('Error updating service: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Delete service "${name}"?`)) return;
    try {
      await axios.delete(`${API_URL}/services/${id}`);
      alert('Service deleted successfully!');
      fetchData();
    } catch (error) {
      alert('Error deleting service: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- DOCTOR SCHEDULES CRUD ---
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/schedules`, {
        doctor_id: Number(newSchedule.doctor_id),
        day_of_week: newSchedule.day_of_week,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
      });
      alert('Doctor schedule saved!');
      setNewSchedule({
        doctor_id: '',
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '17:00',
      });
      fetchData();
    } catch (error) {
      alert('Error adding schedule: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule slot?')) return;
    try {
      await axios.delete(`${API_URL}/schedules/${id}`);
      fetchData();
    } catch (error) {
      alert('Error deleting schedule: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- NOTIFICATIONS ---
  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (popupNotif?.id === id) setPopupNotif(null);
    } catch (error) {
      alert('Error removing notification');
    }
  };

  // --- OTHER ACTIONS ---
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

  const handleUpdateStatus = async (id, status) => {
    try {
      const targetApp = appointments.find((a) => a.id === id);
      await axios.patch(`${API_URL}/appointments/${id}/status`, { status });

      const patientId = targetApp?.patient_id ?? targetApp?.patient?.id;
      if (patientId) {
        try {
          await axios.post(`${API_URL}/notifications`, {
            user_id: Number(patientId),
            title:
              status === 'confirmed'
                ? 'Appointment Confirmed'
                : 'Appointment Status Updated',
            message: `Your appointment with ${
              targetApp.doctor?.full_name || 'Doctor'
            } on ${new Date(targetApp.appointment_date).toLocaleDateString()} at ${
              targetApp.appointment_time
            } is now ${status.toUpperCase()}.`,
            is_read: false,
          });
        } catch (notifErr) {
          console.error('Error sending patient notification:', notifErr);
        }
      }

      fetchData();
    } catch (error) {
      alert('Error updating status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-sky-100 font-sans">
      {/* Live Pop-Up Alert kapag may nag-book na user */}
      {popupNotif && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-white border-l-4 border-blue-600 shadow-2xl rounded-xl p-4 animate-bounce">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-blue-600">🔔 New Appointment Alert</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5">{popupNotif.title}</p>
              <p className="text-xs text-gray-600 mt-1">{popupNotif.message}</p>
            </div>
            <button
              onClick={() => setPopupNotif(null)}
              className="text-xs text-gray-400 hover:text-gray-700 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <nav className="bg-white shadow-sm p-4 flex justify-between items-center border-b-4 border-blue-600 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏥</span>
          <h1 className="text-xl font-bold text-blue-700">CareSlot Admin Panel</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-gray-700">Admin User</span>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Management</h2>

        {/* Notifications Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-amber-500 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">🔔 Booking Notifications ({notifications.length})</h3>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No new booking notifications yet.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex justify-between items-start p-3 bg-amber-50 border border-amber-200 rounded"
                >
                  <div>
                    <p className="font-bold text-sm text-gray-800">{notif.title}</p>
                    <p className="text-xs text-gray-600">{notif.message}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="text-xs bg-white text-red-600 border border-red-200 px-2.5 py-1 rounded hover:bg-red-50 ml-3"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 1: Doctor and Service Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Doctor</h3>
            <form onSubmit={handleAddDoctor} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name (e.g., Dr. Jose Rizal)"
                required
                className="w-full p-2 border rounded"
                value={newDoctor.full_name}
                onChange={(e) => setNewDoctor({ ...newDoctor, full_name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Specialization (e.g., Dentist)"
                required
                className="w-full p-2 border rounded"
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
              />
              <input
                type="number"
                placeholder="Consultation Fee"
                required
                className="w-full p-2 border rounded"
                value={newDoctor.consultation_fee}
                onChange={(e) => setNewDoctor({ ...newDoctor, consultation_fee: e.target.value })}
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full font-semibold">
                Add Doctor
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Service</h3>
            <form onSubmit={handleAddService} className="space-y-3">
              <input
                type="text"
                placeholder="Service Name (e.g., Dental Check-up)"
                required
                className="w-full p-2 border rounded"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price"
                required
                className="w-full p-2 border rounded"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full font-semibold mt-11">
                Add Service
              </button>
            </form>
          </div>
        </div>

        {/* Doctor Schedules Manager */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-indigo-500 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🗓️ Doctor Schedules</h3>
          <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
            <select
              required
              className="p-2 border rounded text-sm"
              value={newSchedule.doctor_id}
              onChange={(e) => setNewSchedule({ ...newSchedule, doctor_id: e.target.value })}
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.full_name}
                </option>
              ))}
            </select>

            <select
              className="p-2 border rounded text-sm"
              value={newSchedule.day_of_week}
              onChange={(e) => setNewSchedule({ ...newSchedule, day_of_week: e.target.value })}
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>

            <input
              type="time"
              required
              className="p-2 border rounded text-sm"
              value={newSchedule.start_time}
              onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
            />

            <input
              type="time"
              required
              className="p-2 border rounded text-sm"
              value={newSchedule.end_time}
              onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
            />

            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-semibold"
            >
              + Set Schedule
            </button>
          </form>

          {schedules.length === 0 ? (
            <p className="text-sm text-gray-500">No doctor schedules set yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {schedules.map((sched) => (
                <div
                  key={sched.id}
                  className="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded"
                >
                  <div>
                    <p className="font-bold text-sm text-gray-800">
                      {sched.doctor?.full_name || `Doctor #${sched.doctor_id}`}
                    </p>
                    <p className="text-xs text-indigo-700 font-semibold">
                      {sched.day_of_week}: {sched.start_time} - {sched.end_time}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSchedule(sched.id)}
                    className="bg-red-100 text-red-700 border border-red-300 px-2.5 py-1 rounded text-xs font-semibold hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 2: Current Doctors and Services Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Doctors List */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-300">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Current Doctors</h3>
            <ul className="space-y-2">
              {doctors.map((doc) => (
                <li key={doc.id} className="border p-3 rounded bg-gray-50">
                  {editingDoctorId === doc.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full p-1.5 border rounded text-sm"
                        value={editDoctorData.full_name}
                        onChange={(e) => setEditDoctorData({ ...editDoctorData, full_name: e.target.value })}
                        placeholder="Full Name"
                      />
                      <input
                        type="text"
                        className="w-full p-1.5 border rounded text-sm"
                        value={editDoctorData.specialization}
                        onChange={(e) => setEditDoctorData({ ...editDoctorData, specialization: e.target.value })}
                        placeholder="Specialization"
                      />
                      <input
                        type="number"
                        className="w-full p-1.5 border rounded text-sm"
                        value={editDoctorData.consultation_fee}
                        onChange={(e) => setEditDoctorData({ ...editDoctorData, consultation_fee: e.target.value })}
                        placeholder="Consultation Fee"
                      />
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateDoctor(doc.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDoctorId(null)}
                          className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <p className="font-bold text-gray-800">{doc.full_name}</p>
                        <p className="text-sm text-gray-500">{doc.specialization}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600 font-semibold mr-1">₱{doc.consultation_fee}</span>
                        <button
                          type="button"
                          onClick={() => startEditDoctor(doc)}
                          className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded text-xs font-semibold hover:bg-amber-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoctor(doc.id, doc.full_name)}
                          className="bg-red-100 text-red-700 border border-red-300 px-2.5 py-1 rounded text-xs font-semibold hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
              {doctors.length === 0 && <p className="text-gray-500 text-sm">No doctors added yet.</p>}
            </ul>
          </div>

          {/* Current Services List */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-300">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Current Services</h3>
            <ul className="space-y-2">
              {services.map((ser) => (
                <li key={ser.id} className="border p-3 rounded bg-gray-50">
                  {editingServiceId === ser.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full p-1.5 border rounded text-sm"
                        value={editServiceData.name}
                        onChange={(e) => setEditServiceData({ ...editServiceData, name: e.target.value })}
                        placeholder="Service Name"
                      />
                      <input
                        type="number"
                        className="w-full p-1.5 border rounded text-sm"
                        value={editServiceData.price}
                        onChange={(e) => setEditServiceData({ ...editServiceData, price: e.target.value })}
                        placeholder="Price"
                      />
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateService(ser.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingServiceId(null)}
                          className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center gap-2">
                      <p className="font-bold text-gray-800">{ser.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-semibold mr-1">₱{ser.price}</span>
                        <button
                          type="button"
                          onClick={() => startEditService(ser)}
                          className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded text-xs font-semibold hover:bg-amber-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(ser.id, ser.name)}
                          className="bg-red-100 text-red-700 border border-red-300 px-2.5 py-1 rounded text-xs font-semibold hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
              {services.length === 0 && <p className="text-gray-500 text-sm">No services added yet.</p>}
            </ul>
          </div>
        </div>

        {/* Row 3: Change Admin Password Form */}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold">TOTAL DOCTORS</h3>
            <p className="text-3xl font-bold text-gray-800">{doctors.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-semibold">TOTAL SERVICES</h3>
            <p className="text-3xl font-bold text-gray-800">{services.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
            <h3 className="text-gray-500 text-sm font-semibold">DOCTOR SCHEDULES</h3>
            <p className="text-3xl font-bold text-gray-800">{schedules.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-semibold">TOTAL APPOINTMENTS</h3>
            <p className="text-3xl font-bold text-gray-800">{appointments.length}</p>
          </div>
        </div>

        {/* Recent Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto mb-8">
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
                  <td className="p-3 border-b">
                    {new Date(app.appointment_date).toLocaleDateString()} {app.appointment_time}
                  </td>
                  <td className="p-3 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold
                      ${
                        app.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : app.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    {app.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 font-semibold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 font-semibold"
                        >
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
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Patient Medical Files Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📁 Patient Medical Files ({medicalFiles.length})</h3>
          {medicalFiles.length === 0 ? (
            <p className="text-sm text-gray-500">No medical files uploaded by patients yet.</p>
          ) : (
            <ul className="space-y-2">
              {medicalFiles.map((file) => (
                <li key={file.id} className="p-3 bg-gray-50 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{file.file_name}</p>
                    <p className="text-xs text-gray-500">
                      Patient: {file.patient?.full_name || `User #${file.patient_id}`} • {file.file_url}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}