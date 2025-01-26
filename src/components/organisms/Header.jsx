import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const userEmail = localStorage.getItem('userEmail');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    return (
        <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
                <Link to="/"><h1 className="text-2xl font-bold">Quizlet Clone</h1></Link>

                {userEmail ? (
                    <button
                        className="ml-4 bg-white text-blue-500 py-2 px-4 rounded"
                        onClick={() => navigate('/add-set')}
                    >
                        Add Set
                    </button> ) : null
                }

            </div>
            <nav>
                {userEmail ? (
                    <div className="flex items-center">
                        <span className="mr-4">Welcome, {userEmail}</span>
                        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded">
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/register" className="mr-4">Register</Link>
                        <Link to="/login">Login</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;