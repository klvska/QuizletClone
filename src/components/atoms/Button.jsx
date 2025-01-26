import PropTypes from 'prop-types';

const Button = ({ children, onClick, className }) => {
    return (
        <button
            className={`bg-blue-500 text-white py-2 px-4 rounded ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};

Button.defaultProps = {
    className: '',
};

export default Button;