const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cors = require('cors');
const express = require('express');
const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});

app.get('/', cors(), async (req, res) => {
    try {
        const boards = await prisma.board.findMany();
        res.json(boards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch boards' });
    }
});

app.post('/', cors(), async (req, res) => {
    const { title, category, author } = req.body;
    try {
        const newBoard = await prisma.board.create({
            data: {
                title,
                category,
                author,
                createdAt: new Date(),
            },
        });
        res.json(newBoard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create board' });
    }
});

app.delete('/:id', cors(), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.card.deleteMany({
            where: { boardId: parseInt(id, 10) }
        });

        const deletedBoard = await prisma.board.delete({
            where: { id: parseInt(id, 10) }
        });
        res.json(deletedBoard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete board' });
    }
});

app.get('/:id', cors(), async (req, res) => {
    const { id } = req.params;
    try {
        const board = await prisma.board.findUnique({
            where: { id: parseInt(id, 10) },
            include: { cards: true },
        });
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.json(board);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch board' });
    }
});

app.post('/:id', cors(), async (req, res) => {
    const { id } = req.params;
    const { title, description, gif, author } = req.body;
    try {
        const newCard = await prisma.card.create({
            data: {
                title,
                description,
                gif,
                author,
                boardId: parseInt(id, 10),
            },
        });
        res.json(newCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create card' });
    }
});

app.put('/cards/:cardId/upvote', cors(), async (req, res) => {
    const { cardId } = req.params;
    try {
        const updatedCard = await prisma.card.update({
            where: { id: parseInt(cardId, 10) },
            data: {
                upvotes: { increment: 1 },
            },
        });
        res.json(updatedCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upvote card' });
    }
});

app.delete('/cards/:cardId', cors(), async (req, res) => {
    const { cardId } = req.params;
    try {
        const deletedCard = await prisma.card.delete({
            where: { id: parseInt(cardId, 10) },
        });
        res.json(deletedCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete card' });
    }
});
