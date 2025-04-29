import React from "react";
import PropTypes from "prop-types";

const SetCard = ({
  title,
  userEmail,
  userName,
  cardCount,
  description,
  isPublic,
}) => {
  return (
    <div className="bg-[#2e3856]/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-[#4255ff]/20 transition-all duration-300 h-full border border-[#4255ff]/10">
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold text-white line-clamp-2">
              {title}
            </h3>
            {isPublic && (
              <span className="px-3 py-1 bg-gradient-to-r from-[#4255ff] to-[#423ed8] text-white text-xs rounded-full shadow-lg">
                Publiczny
              </span>
            )}
          </div>
          {description && (
            <p className="text-[#939bb4] text-sm line-clamp-2 mb-4">
              {description}
            </p>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-[#4255ff]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4255ff] to-[#423ed8] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {userName
                  ? userName[0].toUpperCase()
                  : userEmail[0].toUpperCase()}
              </div>
              <span className="ml-3 text-[#939bb4] font-medium truncate max-w-[120px]">
                {userName || userEmail}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-[#939bb4] font-medium">
                {cardCount} {cardCount === 1 ? "karta" : "karty"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SetCard.propTypes = {
  title: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired,
  userName: PropTypes.string,
  cardCount: PropTypes.number.isRequired,
  description: PropTypes.string,
  isPublic: PropTypes.bool.isRequired,
};

export default SetCard;
