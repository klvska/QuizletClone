import { useState } from 'react';
import PropTypes from 'prop-types';
import CardForm from '../molecules/CardForm';
import { addSetWithCards } from '../../services/addSetService';

const AddSetForm = ({ userId, onSetAdded }) => {
    const [title, setTitle] = useState('');
    const [cards, setCards] = useState([{ question: '', answer: '' }]);

    const handleCardChange = (index, field, value) => {
        const newCards = [...cards];
        newCards[index][field] = value;
        setCards(newCards);
    };

    const handleAddCard = () => {
        setCards([...cards, { question: '', answer: '' }]);
    };

    const handleRemoveCard = (index) => {
        const newCards = cards.filter((_, i) => i !== index);
        setCards(newCards);
    };

    const handleAddSet = async () => {
        try {
            const response = await addSetWithCards(title, userId, cards);
            console.log('Set and cards added:', response);
            onSetAdded(response);
            setTitle('');
            setCards([{ question: '', answer: '' }]);
        } catch (error) {
            console.error('Error adding set and cards:', error);
        }
    };

    return (
        <div className="w-full h-full flex flex-col justify-start items-center">
            <form
                className="w-full max-w-screen-lg p-4 flex flex-col justify-start items-center bg-white shadow-md rounded"
                onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Set Title"
                    required
                    className="mb-4 p-2 border rounded w-full"
                />
                {cards.map((card, index) => (
                    <CardForm
                        key={index}
                        card={card}
                        index={index}
                        handleCardChange={handleCardChange}
                        handleRemoveCard={handleRemoveCard}
                    />
                ))}
                <button
                    type="button"
                    onClick={handleAddCard}
                    className="mb-4 p-2 bg-blue-500 text-white rounded"
                >
                    Add Card
                </button>
                <button
                    type="button"
                    onClick={handleAddSet}
                    className="p-2 bg-green-500 text-white rounded"
                >
                    Add Set and Cards
                </button>
            </form>
        </div>
    );
};

AddSetForm.propTypes = {
    userId: PropTypes.number.isRequired,
    onSetAdded: PropTypes.func.isRequired,
};

export default AddSetForm;