import PropTypes from 'prop-types';

const Card = ({ question, answer }) => {
    return (
        //TODO: Implement the Card component
        <div className="border p-4 flex rounded shadow">
            <p className="font-bold">{question}</p>
            <p>{answer}</p>
        </div>
    );
};

Card.propTypes = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
};

export default Card;