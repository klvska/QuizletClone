import axios from 'axios';

export const addSetWithCards = async (title, userId, cards) => {
    try {
        const response = await axios.post('http://localhost:3001/sets', { title, userId, cards });
        console.log('Set and cards created:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating set and cards:', error);
        throw error;
    }
};