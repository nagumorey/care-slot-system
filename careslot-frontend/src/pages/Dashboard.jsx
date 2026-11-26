import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function toHHMM(timeStr) {
  return String(timeStr || '').slice(0, 5);
}

function generateTimeSlots(startStr, endStr, stepMinutes = 30) {
  const start = toHHMM(startStr);
  const end = toHHMM(endStr);
  if (!start || !end) return [];

  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some(Number.isNaN)) return [];

  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  if (endMins < startMins) return [];

  const slots = [];
  for (let m = startMins; m <= endMins; m += stepMinutes) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [allDoctorAppointments, setAllDoctorAppointments] = useState([]);
  const [showBooking, setShowBooking] = useState(false);

  // States para sa Form & Schedules
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    service_id: '',
    appointment_date: '',
    appointment_time: '',
  });

  // States para sa Medical Files
  const [medicalFiles, setMedicalFiles] = useState([]);
  const [fileForm, setFileForm] = useState({
    file_name: '',
    file_url: '',
    appointment_id: '',
  });

  // States para sa Notifications
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchAppointments(parsedUser.id);
    fetchFormData();
    fetchAllSchedules();
    fetchMedicalFiles(parsedUser.id);
    fetchNotifications(parsedUser.id);

    const interval = setInterval(() => {
      fetchAppointments(parsedUser.id);
      fetchNotifications(parsedUser.id);
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (formData.doctor_id) {
      fetchDoctorSchedules(formData.doctor_id);
    } else {
      setDoctorSchedules([]);
    }
  }, [formData.doctor_id, allSchedules]);

  const fetchAppointments = async (patientId) => {
    try {
      const res = await axios.get(`${API_URL}/appointments`);
      const allApps = Array.isArray(res.data) ? res.data : [];
      setAllDoctorAppointments(allApps);
      const myApps = allApps.filter((app) => app.patient_id === patientId);
      setAppointments(myApps);
    } catch (error) {
      console.error('Error fetching appointments', error);
    }
  };

  const fetchFormData = async () => {
    try {
      const res = await axios.get(`${API_URL}/appointments/form-data`);
      setDoctors(res.data.doctors || []);
      setServices(res.data.services || []);
    } catch (error) {
      console.error('Error fetching form data', error);
    }
  };

  const fetchAllSchedules = async () => {
    try {
      const res = await axios.get(`${API_URL}/schedules`);
      setAllSchedules(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching all schedules', error);
      setAllSchedules([]);
    }
  };

  const fetchDoctorSchedules = async (doctorId) => {
    try {
      const res = await axios.get(`${API_URL}/schedules`, {
        params: { doctorId },
      });
      let rows = Array.isArray(res.data) ? res.data : [];

      if (rows.length === 0) {
        rows = allSchedules.filter(
          (slot) =>
            String(slot.doctor_id ?? slot.doctorId ?? slot.doctor?.id) ===
            String(doctorId),
        );
      }

      setDoctorSchedules(rows);
    } catch (error) {
      console.error('Error fetching doctor schedules', error);
      const fallbackRows = allSchedules.filter(
        (slot) =>
          String(slot.doctor_id ?? slot.doctorId ?? slot.doctor?.id) ===
          String(doctorId),
      );
      setDoctorSchedules(fallbackRows);
    }
  };

  const fetchMedicalFiles = async (patientId) => {
    try {
      const res = await axios.get(`${API_URL}/medical-files`, {
        params: { patientId },
      });
      setMedicalFiles(res.data || []);
    } catch (error) {
      console.error('Error fetching medical files', error);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        params: { userId },
      });
      let rows = Array.isArray(res.data) ? res.data : [];

      if (rows.length === 0) {
        const allRes = await axios.get(`${API_URL}/notifications`);
        rows = (Array.isArray(allRes.data) ? allRes.data : []).filter(
          (n) => String(n.user_id ?? n.userId ?? n.user?.id) === String(userId),
        );
      }

      setNotifications(rows);
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  // Kunin ang naka-booked na oras para sa piniling doctor at date
  const takenTimes = useMemo(() => {
    if (!formData.doctor_id || !formData.appointment_date) return new Set();

    const set = new Set();
    allDoctorAppointments.forEach((app) => {
      const sameDoc =
        String(app.doctor_id ?? app.doctor?.id) === String(formData.doctor_id);
      const appDate = String(app.appointment_date || '').slice(0, 10);
      const notCancelled = String(app.status || '').toLowerCase() !== 'cancelled';

      if (sameDoc && appDate === formData.appointment_date && notCancelled) {
        set.add(toHHMM(app.appointment_time));
      }
    });
    return set;
  }, [allDoctorAppointments, formData.doctor_id, formData.appointment_date]);

  // Kunin ang schedule window ng doctor para sa araw ng piniling date (o lahat ng schedules niya)
  const activeSchedulesForDoctor = useMemo(() => {
    if (!formData.doctor_id) return [];
    if (!formData.appointment_date) return doctorSchedules;

    const d = new Date(`${formData.appointment_date}T00:00:00`);
    if (Number.isNaN(d.getTime())) return doctorSchedules;

    const dayName = DAY_NAMES[d.getDay()];
    const byDay = doctorSchedules.filter(
      (s) => String(s.day_of_week || '').toLowerCase() === dayName.toLowerCase(),
    );
    return byDay.length > 0 ? byDay : doctorSchedules;
  }, [doctorSchedules, formData.doctor_id, formData.appointment_date]);

  // Generate selectable slots mula sa schedule window ng doctor (hal. 09:00 to 17:00)
  const availableSlots = useMemo(() => {
    const slotSet = new Set();
    activeSchedulesForDoctor.forEach((slot) => {
      generateTimeSlots(slot.start_time, slot.end_time, 30).forEach((t) =>
        slotSet.add(t),
      );
    });
    return Array.from(slotSet);
  }, [activeSchedulesForDoctor]);

  const validateBookingSelection = () => {
    const chosenTime = toHHMM(formData.appointment_time);
    if (!chosenTime) return 'Please select an appointment time.';

    if (takenTimes.has(chosenTime)) {
      return `The ${chosenTime} slot is already booked for this doctor on ${formData.appointment_date}. Please pick another time.`;
    }

    if (activeSchedulesForDoctor.length > 0) {
      const insideSchedule = activeSchedulesForDoctor.some((slot) => {
        const start = toHHMM(slot.start_time);
        const end = toHHMM(slot.end_time);
        return chosenTime >= start && chosenTime <= end;
      });

      if (!insideSchedule) {
        const rangeLabels = activeSchedulesForDoctor
          .map((s) => `${toHHMM(s.start_time)} - ${toHHMM(s.end_time)}`)
          .join(', ');
        return `Selected time (${chosenTime}) is outside the doctor's schedule (${rangeLabels}).`;
      }
    }

    return null;
  };

  const handleBook = async (e) => {
    e.preventDefault();

    const validationError = validateBookingSelection();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      await axios.post(`${API_URL}/appointments`, {
        ...formData,
        doctor_id: Number(formData.doctor_id),
        service_id: Number(formData.service_id),
        patient_id: user.id,
      });

      try {
        const chosenDoc = doctors.find(
          (d) => String(d.id) === String(formData.doctor_id),
        );
        await axios.post(`${API_URL}/notifications`, {
          user_id: 1,
          title: 'New Appointment Booked',
          message: `${user.full_name || user.email} booked with ${
            chosenDoc?.full_name || 'Doctor'
          } on ${formData.appointment_date} at ${formData.appointment_time}`,
          is_read: false,
        });
      } catch (notifError) {
        console.error('Error sending booking notification:', notifError);
      }

      alert('Appointment Booked Successfully!');
      setShowBooking(false);
      setFormData({
        doctor_id: '',
        service_id: '',
        appointment_date: '',
        appointment_time: '',
      });
      fetchAppointments(user.id);
      fetchNotifications(user.id);
    } catch (error) {
      alert('Booking Failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddMedicalFile = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/medical-files`, {
        patient_id: user.id,
        file_name: fileForm.file_name,
        file_url: fileForm.file_url,
        appointment_id: fileForm.appointment_id ? Number(fileForm.appointment_id) : null,
      });
      setFileForm({ file_name: '', file_url: '', appointment_id: '' });
      fetchMedicalFiles(user.id);
    } catch (error) {
      alert('Failed to add file: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteMedicalFile = async (id) => {
    try {
      await axios.delete(`${API_URL}/medical-files/${id}`);
      setMedicalFiles((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert('Failed to delete file: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert('Failed to delete notification: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const minAllowedTime =
    activeSchedulesForDoctor.length > 0
      ? activeSchedulesForDoctor
          .map((s) => toHHMM(s.start_time))
          .filter(Boolean)
          .sort()[0]
      : undefined;

  const maxAllowedTime =
    activeSchedulesForDoctor.length > 0
      ? activeSchedulesForDoctor
          .map((s) => toHHMM(s.end_time))
          .filter(Boolean)
          .sort()
          .slice(-1)[0]
      : undefined;

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
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-md flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Hello, {user.full_name ? user.full_name.split(' ')[0] : 'Patient'}! 👋
            </h2>
            <p className="text-blue-100">Welcome to your health portal. How can we help you today?</p>
          </div>
          <button
            onClick={() => setShowBooking(!showBooking)}
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-bold shadow hover:bg-gray-50 transition-colors"
          >
            {showBooking ? 'Cancel Booking' : '+ Book Appointment'}
          </button>
        </div>

        {/* Booking Form + Doctor Schedules */}
        {showBooking && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 space-y-5">
            <h3 className="text-lg font-bold text-gray-800">Book a New Appointment</h3>
            <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select Doctor</label>
                <select
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.doctor_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      doctor_id: e.target.value,
                      appointment_time: '',
                    })
                  }
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.full_name} ({doc.specialization}) — Consultation Fee: ₱{doc.consultation_fee}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select Service</label>
                <select
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                >
                  <option value="">-- Choose Service --</option>
                  {services.map((ser) => (
                    <option key={ser.id} value={ser.id}>
                      {ser.name} — Service Fee: ₱{ser.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  required
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={formData.appointment_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointment_date: e.target.value,
                      appointment_time: '',
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Time{' '}
                  {minAllowedTime && maxAllowedTime
                    ? `(Allowed: ${minAllowedTime} - ${maxAllowedTime})`
                    : ''}
                </label>
                <input
                  required
                  type="time"
                  min={minAllowedTime}
                  max={maxAllowedTime}
                  className="w-full p-2 border rounded-md"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                />
              </div>

              {formData.doctor_id && (
                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                  <div>
                    <p className="text-sm font-bold text-blue-800">
                      Doctor Schedule Window
                    </p>
                    {doctorSchedules.length === 0 ? (
                      <p className="text-xs text-gray-600">No schedule records found for this doctor.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {doctorSchedules.map((slot) => (
                          <span
                            key={slot.id}
                            className="text-xs bg-white border border-blue-200 text-blue-900 px-3 py-1 rounded-full"
                          >
                            {slot.day_of_week || 'Schedule'}: {toHHMM(slot.start_time)} - {toHHMM(slot.end_time)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {availableSlots.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1.5">
                        Available Time Slots (Booked times are disabled)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {availableSlots.map((slotTime) => {
                          const isTaken = takenTimes.has(slotTime);
                          const isSelected = toHHMM(formData.appointment_time) === slotTime;
                          return (
                            <button
                              type="button"
                              key={slotTime}
                              disabled={isTaken}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  appointment_time: slotTime,
                                }))
                              }
                              className={`text-xs px-2.5 py-1 rounded border font-medium transition-colors ${
                                isTaken
                                  ? 'bg-red-100 text-red-500 border-red-200 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-100 cursor-pointer'
                              }`}
                            >
                              {slotTime} {isTaken ? '(Booked)' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full md:w-auto font-semibold"
                >
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
              {appointments.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{app.doctor?.full_name || 'Doctor'}</p>
                    <p className="text-sm text-gray-500 mb-1">{app.service?.name || 'Service'}</p>
                    <p className="text-sm text-green-600 font-semibold mb-1">
                      Consultation Fee: ₱{app.doctor?.consultation_fee || 0}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      📅 {new Date(app.appointment_date).toLocaleDateString()} at {app.appointment_time}
                    </p>
                    <p className="text-xs text-indigo-700 font-medium mt-0.5">
                      Booked Schedule: {app.appointment_date} • {app.appointment_time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${
                      app.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : app.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medical Files */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">📁 My Medical Files</h3>

          <form onSubmit={handleAddMedicalFile} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              required
              type="text"
              placeholder="File name (e.g. Lab Result.pdf)"
              className="p-2 border rounded-md text-sm"
              value={fileForm.file_name}
              onChange={(e) => setFileForm({ ...fileForm, file_name: e.target.value })}
            />
            <input
              required
              type="text"
              placeholder="File URL or path"
              className="p-2 border rounded-md text-sm"
              value={fileForm.file_url}
              onChange={(e) => setFileForm({ ...fileForm, file_url: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Appointment ID (optional)"
                className="p-2 border rounded-md text-sm w-full"
                value={fileForm.appointment_id}
                onChange={(e) => setFileForm({ ...fileForm, appointment_id: e.target.value })}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-semibold whitespace-nowrap"
              >
                + Add
              </button>
            </div>
          </form>

          {medicalFiles.length === 0 ? (
            <p className="text-sm text-gray-500">No medical files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {medicalFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{file.file_name}</p>
                    <p className="text-xs text-gray-500 break-all">{file.file_url}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteMedicalFile(file.id)}
                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">🔔 Notifications</h3>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications right now.</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex justify-between items-start p-3 bg-sky-50 rounded-lg border border-sky-100"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{notif.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="text-xs bg-white text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-50 ml-3"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}