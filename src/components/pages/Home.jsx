import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SetCard from '../organisms/SetCard';

const Home = () => {
    const [sets, setSets] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/sets')
            .then((response) => response.json())
            .then((data) => {
                console.log('Fetched sets:', data); // Log the fetched data
                const filteredSets = data.filter(set => set.cards && set.cards.length > 0);
                console.log('Filtered sets:', filteredSets); // Log the filtered data
                setSets(filteredSets);
            })
            .catch((error) => {
                console.error('Error fetching sets:', error); // Log any errors
            });
    }, []);

    return (
        <div className="flex justify-center items-center h-full">
            <div className="p-5 w-1/2 text-center">
                {sets.length > 0 ? (
                    sets.map((set) => (
                        <div key={set.id} className="my-2">
                            <Link to={`/sets/${set.id}`}>
                                <SetCard
                                    title={set.title}
                                    userEmail={set.user.email}
                                    cardCount={set.cards.length}
                                />
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="text-lg text-gray-600">No sets with cards available</p>
                )}
            </div>
        </div>
    );
};

export default Home;