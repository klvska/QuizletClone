import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './organisms/Header';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import AddSetForm from './organisms/AddSetForm';
import Sets from './pages/Sets/Sets.jsx'; // Import the Sets component

const App = () => {
    const userId = parseInt(localStorage.getItem('userId'));
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/add-set" element={<AddSetForm userId={userId} onSetAdded={() => {}} />} />
                <Route path="/sets/:setId" element={<Sets />} /> {/* Add the route for set details */}
            </Routes>
        </Router>
    );
};

export default App;