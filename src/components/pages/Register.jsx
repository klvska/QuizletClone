import React, { useState } from 'react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md my-auto mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Register</h2>
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
                Register
            </button>
        </form>
    );
};

export default Register;