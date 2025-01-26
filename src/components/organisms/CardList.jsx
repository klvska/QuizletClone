import PropTypes from 'prop-types';
import Card from '../molecules/Card';

const CardList = ({ cards }) => {
    return (
        <div className="grid grid-cols-1 gap-4">
            {cards.map((card) => (
                <Card key={card.id} question={card.question} answer={card.answer} />
            ))}
        </div>
    );
};

CardList.propTypes = {
    cards: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            question: PropTypes.string.isRequired,
            answer: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default CardList;