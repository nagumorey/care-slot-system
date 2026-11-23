import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/auth/register', {
        ...formData,
        role: 'patient',
      });
      alert('Registration Successful! Please login.');
      navigate('/');
    } catch (error) {
      alert('Registration Failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    // Sky blue background
    <div className="min-h-screen flex items-center justify-center bg-sky-100 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border-t-4 border-green-500">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Create an Account</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-1">Full Name</label>
            <input type="text" className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required
              onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
            <input type="email" className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-1">Password</label>
            <input type="password" className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors mb-4 font-semibold">
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm">
          Already have an account? <Link to="/" className="text-green-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}