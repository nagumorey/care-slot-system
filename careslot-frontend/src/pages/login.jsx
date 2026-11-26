import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation natin, hindi na sa browser
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrorMsg('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">CareSlot Login</h2>
        
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors mb-4 font-semibold">
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}