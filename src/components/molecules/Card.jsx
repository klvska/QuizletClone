import PropTypes from 'prop-types';

const Card = ({ question, answer }) => {
    return (
        <div className="border p-4 rounded shadow">
            <h3 className="font-bold">{question}</h3>
            <p>{answer}</p>
        </div>
    );
};

Card.propTypes = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
};

export default Card;