import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            console.log('Response:', data); // Debugging log
            if (data.email) { // Check if email is present in the response
                localStorage.setItem('userId', data.id);
                localStorage.setItem('userEmail', data.email);
                navigate('/');
            } else {
                console.error('Login failed:', 'Invalid credentials'); // Debugging log
            }
        } catch (error) {
            console.error('Error:', error); // Debugging log
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md my-auto mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                Login
            </button>
        </form>
    );
};

export default Login;