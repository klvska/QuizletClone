import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Sets.css';
import arrow from '../../../assets/arrow.svg';
import Modal from '../../molecules/Modal';

const Sets = () => {
    const { setId } = useParams();
    const [cards, setCards] = useState([]);
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleNextCard = () => {
        if (currentIdx < cards.length - 1) {
            setCurrentIdx(currentIdx + 1);
        } else {
            setCurrentIdx(0);
            setIsModalOpen(true);
        }
    };

    const handlePreviousCard = () => {
        if (currentIdx > 0) {
            setCurrentIdx(currentIdx - 1);
        } else {
            setCurrentIdx(cards.length - 1);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.keyCode === 39) { // Right arrow key
                handleNextCard();
            }
            if (event.keyCode === 37) { // Left arrow key
                handlePreviousCard();
            }
            if (event.keyCode === 32) { // Space key
                handleCardClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentIdx, cards.length]);

    const progressPercentage = (currentIdx + 1) / cards.length * 100;

    return (
        <div className="flex flex-col justify-center items-stretch w-full min-h-full bg-gray-100">
            <div className="flex justify-center items-stretch w-full h-full bg-gray-100">
                <div className="px-5 pt-5 w-full max-w-screen-lg h-full">
                    {cards.length > 0 ? (
                        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={handleCardClick}>
                            <div className="flip-card-inner">
                                <div
                                    className="flip-card-front flex justify-center items-center min-h-[584px] max-w-[1024px] border rounded-lg shadow-lg bg-sky-300">
                                    <div className="p-8">
                                        <p className="text-3xl font-bold">{cards.at(currentIdx).question}</p>
                                    </div>
                                </div>
                                <div
                                    className="flip-card-back flex justify-center items-center min-h-[584px] max-w-[1024px] border rounded-lg shadow-lg bg-sky-300">
                                    <div className="p-8">
                                        <p className="text-3xl font-bold">{cards.at(currentIdx).answer}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg text-gray-600">No cards available</p>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-center gap-10 max-w-[1024px] mx-auto">
                <button className="mx-5 py-1"
                        onClick={handlePreviousCard}>
                    <img src={arrow} alt="Previous"
                         className="w-16 h-16 transform rotate-180 cursor-pointer hover:scale-105 transition-transform duration-200"/>
                </button>
                <p className="text-xl font-bold">{currentIdx + 1} / {cards.length}</p>
                <button className="mx-5 py-1"
                        onClick={handleNextCard}>
                    <img src={arrow} alt="Next"
                         className="w-16 h-16 cursor-pointer hover:scale-105 transition-transform duration-200"/>
                </button>
            </div>
            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-2xl font-bold">Congratulations, you've finished a set!</h2>
                    <a href="#" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Quiz</a>
            </Modal>
        </div>
    );
};

export default Sets;