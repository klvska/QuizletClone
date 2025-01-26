import React from 'react';
import PropTypes from 'prop-types';

const SetCard = ({ title, userEmail, cardCount }) => (
    <div className="border p-4 rounded shadow-md">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-600">{userEmail}</p>
        <p className="text-gray-600">{cardCount} cards</p>
    </div>
);

SetCard.propTypes = {
    title: PropTypes.string.isRequired,
    userEmail: PropTypes.string.isRequired,
    cardCount: PropTypes.number.isRequired,
};

export default SetCard;