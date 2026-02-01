import React, { useState } from 'react';
import { useRegisterMutation } from '../../redux/features/auth';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: ''
  });

  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await register(formData).unwrap();
      console.log("status is", res.status);
      if (res.status === 200) {
        alert('Registration Successful');
    
        setFormData({ name: '', email: '', password: '', password_confirmation: '', phone: '' });
      } 
       if (res.status === 422) {
        alert('Registration Failed');
      }
    } catch (err) {
        alert('Registration Failed');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="border p-2 w-full"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-2 w-full"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 w-full"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password_confirmation"
          placeholder="Confirm Password"
          className="border p-2 w-full"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          className="border p-2 w-full"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className={`bg-blue-500 text-white px-4 py-2 rounded ${isLoading ? 'opacity-50' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
