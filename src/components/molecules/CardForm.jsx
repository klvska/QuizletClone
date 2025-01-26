import React from 'react';
import PropTypes from 'prop-types';

const CardForm = ({ card, index, handleCardChange, handleRemoveCard }) => {
    return (
        <div className="flex mb-4 p-4 border rounded shadow w-full justify-between items-center">
            <input
                type="text"
                value={card.question}
                onChange={(e) => handleCardChange(index, 'question', e.target.value)}
                placeholder="Question"
                required
                className=" p-2 border rounded w-full"
            />
            <input
                type="text"
                value={card.answer}
                onChange={(e) => handleCardChange(index, 'answer', e.target.value)}
                placeholder="Answer"
                required
                className=" p-2 border rounded w-full"
            />
            <button
                type="button"
                onClick={() => handleRemoveCard(index)}
                className="ml-2 h-[42px] p-0.5 text-[12px] bg-red-500 text-white rounded"
            >
                Remove
            </button>
        </div>
    );
};

CardForm.propTypes = {
    card: PropTypes.shape({
        question: PropTypes.string.isRequired,
        answer: PropTypes.string.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
    handleCardChange: PropTypes.func.isRequired,
    handleRemoveCard: PropTypes.func.isRequired,
};

export default CardForm;