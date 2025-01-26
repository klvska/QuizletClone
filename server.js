import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Endpointy dla użytkowników
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const user = await prisma.user.create({
            data: { email, password },
        });
        res.json(user);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (user && user.password === password) {
        res.json(user);
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Endpointy dla setów
app.post('/sets', async (req, res) => {
    const { title, userId, cards } = req.body;
    try {
        const set = await prisma.set.create({
            data: {
                title,
                userId,
                cards: {
                    create: cards,
                },
            },
            include: {
                cards: true,
            },
        });
        res.json(set);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/sets', async (req, res) => {
    try {
        const sets = await prisma.set.findMany({
            include: {
                cards: true,
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        console.log('Fetched sets with cards and user email:', sets);
        res.json(sets);
    } catch (error) {
        console.error('Error fetching sets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpointy dla kart
app.post('/cards', async (req, res) => {
    const { question, answer, setId } = req.body;
    const card = await prisma.card.create({
        data: { question, answer, setId },
    });
    res.json(card);
});

app.get('/sets/:setId/cards', async (req, res) => {
    const { setId } = req.params;
    const cards = await prisma.card.findMany({
        where: { setId: parseInt(setId) },
    });
    res.json(cards);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});