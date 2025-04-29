import React, { useState } from "react";
import PropTypes from "prop-types";
import "./Card.css";

const Card = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="perspective-1000 w-64 h-96 cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-center h-full text-xl font-semibold">
            {front}
          </div>
        </div>
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-pink-500 to-orange-600 rounded-xl p-6 text-white rotate-y-180">
          <div className="flex items-center justify-center h-full text-xl font-semibold">
            {back}
          </div>
        </div>
      </div>
    </div>
  );
};

Card.propTypes = {
  front: PropTypes.string.isRequired,
  back: PropTypes.string.isRequired,
};

export default Card;
