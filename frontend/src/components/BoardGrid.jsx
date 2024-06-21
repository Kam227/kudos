import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BoardGrid.css';
import Board from './Board.jsx';
import { IoMdClose } from "react-icons/io";

const BoardGrid = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [boards, setBoards] = useState([]);
    const [newBoard, setNewBoard] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredBoard, setFilteredBoard] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [images, setImages] = useState([]);

    async function fetchBoards() {
        try {
            const response = await fetch('http://localhost:3000');
            if (!response.ok) {
                throw new Error('Failed to fetch boards');
            }
            const data = await response.json();
            setBoards(data);
            if (searchQuery === '') {
                setIsSearching(false);
                setSearchResults([]);
            } else {
                setIsSearching(true);
                const filteredBoards = data.filter(board => board.title.toLowerCase().includes(searchQuery.toLowerCase()));
                setSearchResults(filteredBoards);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const openModal = () => {
        setNewBoard(true);
    };

    const closeModal = () => {
        setNewBoard(false);
    };

    const createBoard = async (boardData) => {
        try {
            const response = await fetch('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(boardData),
            });
            if (!response.ok) {
                throw new Error('Failed to create board');
            }
            const newBoard = await response.json();
            setBoards([...boards, newBoard]);
            closeModal();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteBoard = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete board');
            }
            const updatedBoards = boards.filter(board => board.id !== id);
            setBoards(updatedBoards);
        } catch (error) {
            console.error(error);
        }
    }

    const handleFilterByCategory = (category) => {
        setSelectedCategory(category);
        if (category === 'All') {
            setIsFiltering(false);
            setFilteredBoard([]);
        } else {
            setIsFiltering(true);
            if (category === 'Recent') {
                const now = new Date();
                const recentBoards = boards.filter(board => (now - new Date(board.createdAt)) / 60000 <= 10);
                setFilteredBoard(recentBoards);
            } else {
                const filtered = boards.filter(board => board.category === category);
                setFilteredBoard(filtered);
            }
        }
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    }

    useEffect(() => {
        fetchBoards();
    }, [searchQuery]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch(`https://picsum.photos/v2/list?page=1&limit=50`);
                if (!response.ok) {
                    throw new Error('Failed to fetch images');
                }
                const data = await response.json();
                setImages(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchImages();
    }, []);

    const randomImage = () => {
        if (images.length === 0) return './placeholder-image.jpg';
        let index = Math.floor(Math.random() * images.length);
        return images[index].download_url;
    }

    const getCategoryLabel = (board) => {
        const now = new Date();
        if ((now - new Date(board.createdAt)) / 60000 <= 10) {
            return 'Recent';
        }
        return board.category;
    }

    return (
        <div className="overlay">
            <input className="search" type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Search..." />
            <div className="categories">
                <p onClick={() => handleFilterByCategory('All')}>All</p>
                <p onClick={() => handleFilterByCategory('Celebration')}>Celebration</p>
                <p onClick={() => handleFilterByCategory('Thank you')}>Thank you</p>
                <p onClick={() => handleFilterByCategory('Inspiration')}>Inspiration</p>
                <p onClick={() => handleFilterByCategory('Recent')}>Recent</p>
            </div>
            <div className="new-board">
                <button onClick={openModal}>Create new board</button>
            </div>
            <div className="board-grid">
                {(isSearching ? searchResults : (isFiltering ? filteredBoard : boards)).map((board) => (
                    <Board
                        key={board.id}
                        image={randomImage()}
                        title={board.title}
                        category={getCategoryLabel(board)}
                        onOpen={() => navigate('/' + board.id)}
                        onDelete={() => deleteBoard(board.id)}
                    />
                ))}
            </div>
            {newBoard && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="close" onClick={closeModal}>
                            <IoMdClose />
                        </div>
                        <p>Create a Board</p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = {
                                    title: e.target.title.value,
                                    category: e.target.category.value,
                                    author: e.target.author.value,
                                };
                                createBoard(formData);
                            }}
                        >

                                <input type="text" name="title" placeholder="Board title" required />
                                <select name="category" required>
                                    <option value="Celebration">Celebration</option>
                                    <option value="Thank you">Thank you</option>
                                    <option value="Inspiration">Inspiration</option>
                                </select>
                                <input type="text" name="author" placeholder="Board author (optional)"  />
                                <button type="submit">Create Board</button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoardGrid;
