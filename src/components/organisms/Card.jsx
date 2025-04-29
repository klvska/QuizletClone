import React from "react";
import PropTypes from "prop-types";

const Card = ({ front, back, isFlipped, onFlip }) => {
  return (
    <div
      className="w-full max-w-4xl aspect-video mx-auto bg-[#2e3856] rounded-xl shadow-xl cursor-pointer"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-8">
          <p className="text-4xl text-white text-center font-medium">{front}</p>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-8">
          <p className="text-4xl text-white text-center font-medium">{back}</p>
        </div>
      </div>
    </div>
  );
};

Card.propTypes = {
  front: PropTypes.string.isRequired,
  back: PropTypes.string.isRequired,
  isFlipped: PropTypes.bool.isRequired,
  onFlip: PropTypes.func.isRequired,
};

export default Card;
