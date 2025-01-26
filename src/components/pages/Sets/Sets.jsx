import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Sets.css';
import arrow from '../../../assets/arrow.svg';

const Sets = () => {
    const { setId } = useParams();
    const [cards, setCards] = useState([]);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:3001/sets/${setId}/cards`)
            .then((response) => response.json())
            .then((data) => {
                setCards(data);
            })
            .catch((error) => {
                console.error('Error fetching cards:', error);
            });
    }, [setId]);

    const handleCardClick = () => {
        setIsFlipped(!isFlipped);
    };

    let currentIdx = 0;

    return (
        <div className="flex flex-col justify-center items-stretch w-full h-full bg-gray-100">
            <div className="flex justify-center items-stretch w-full h-full bg-gray-100">
                <div className="p-5 w-full max-w-screen-lg">
                    {cards.length > 0 ? (
                        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={handleCardClick}>
                            <div className="flip-card-inner">
                                <div
                                    className="flip-card-front flex justify-center items-center min-h-[584px] max-w-[1024px] border rounded-lg shadow-lg bg-sky-300">
                                    <div className="p-8">
                                        <p className="text-3xl font-bold">{cards.at(0).question}</p>
                                    </div>
                                </div>
                                <div
                                    className="flip-card-back flex justify-center items-center min-h-[584px] max-w-[1024px] border rounded-lg shadow-lg bg-sky-300">
                                    <div className="p-8">
                                        <p className="text-3xl font-bold">{cards.at(0).answer}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg text-gray-600">No cards available</p>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-center max-w-[1024px] mx-auto mt-4">
                <img src={arrow} alt="Previous" className="w-14 h-14 transform rotate-270 cursor-pointer hover:scale-110 transition-transform duration-200"/>
                <img src={arrow} alt="Next" className="w-14 h-14 cursor-pointer rotate-90 hover:scale-110 transition-transform duration-200"/>
            </div>
        </div>
    );
};

export default Sets;