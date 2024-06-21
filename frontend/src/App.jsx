import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import BoardGrid from './components/BoardGrid.jsx';
import BoardPage from './components/BoardPage.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <div>
                        <h1 className="header">Kudoboard</h1>
                        <BoardGrid />
                        <p className="footer">© 2024 Kudoboard</p>
                    </div>
                }/>
                <Route path='/:id' element={<BoardPageRoute />} />
            </Routes>
        </Router>
    );
}

const BoardPageRoute = () => {
    const { id } = useParams();
    const [board, setBoard] = useState(null);

    useEffect(() => {
        async function fetchBoard() {
            try {
                const response = await fetch(`http://localhost:3000/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch board');
                }
                const data = await response.json();
                setBoard(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchBoard();
    }, [id]);

    if (!board) {
        return (
          <div>
            <p>Board doesn't exist...</p>
          </div>
        )
    }

    return <BoardPage {...board} />;
};

export default App;
