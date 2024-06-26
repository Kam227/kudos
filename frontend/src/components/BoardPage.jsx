import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { RiArrowGoBackFill } from "react-icons/ri";
import '../styles/BoardPage.css';
import { IoMdClose } from "react-icons/io";

const BoardPage = (props) => {
    const { id } = useParams();
    const [cards, setCards] = useState([]);
    const [gifs, setGifs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newCardModalOpen, setNewCardModalOpen] = useState(false);
    const [selectedGif, setSelectedGif] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);
    const [activeCardId, setActiveCardId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const response = await fetch(`http://localhost:3000/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch board');
            }
            const boardData = await response.json();
            const cardsWithComments = (boardData.cards || []).map(card => ({
                ...card,
                comments: card.comments || [],
            }));
            setCards(cardsWithComments);
        } catch (error) {
            console.error(error);
            setCards([]);
        }
    };

    useEffect(() => {
        fetchGifs();
    }, [searchQuery]);

    const createCard = async (cardData) => {
        try {
            const response = await fetch(`http://localhost:3000/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cardData),
            });
            if (!response.ok) {
                throw new Error('Failed to create card');
            }
            const newCard = await response.json();
            setCards([...cards, newCard]);
            closeModal();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteCard = async (cardId) => {
        try {
            const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to delete card');
            }
            setCards(cards.filter(card => card.id !== cardId));
        } catch (error) {
            console.error(error);
        }
    };

    const upvoteCard = async (cardId) => {
        try {
            const response = await fetch(`http://localhost:3000/cards/${cardId}/upvote`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to upvote card');
            }
            const updatedCard = await response.json();
            setCards(cards.map(card => card.id === cardId ? updatedCard : card));
        } catch (error) {
            console.error(error);
        }
    };

    const openModal = () => {
        setNewCardModalOpen(true);
    };

    const closeModal = () => {
        setNewCardModalOpen(false);
    };

    const fetchGifs = async () => {
        try {
            const apiKey = import.meta.env.VITE_APP_API_KEY;
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${searchQuery}&limit=5`);
            if (!response.ok) {
                throw new Error('Failed to fetch gifs');
            }
            const data = await response.json();
            setGifs(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
    }

    const handleGifClick = (gifUrl) => {
        setSelectedGif(gifUrl);
    }

    const openComments = (cardId) => {
        setIsCommenting(true);
        setActiveCardId(cardId);
    }

    const closeComments = () => {
        setIsCommenting(false);
        setActiveCardId(null);
    }

    const submitComment = async (cardId, comment) => {
        try {
            const response = await fetch(`http://localhost:3000/cards/${cardId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(comment)
            });
            if (!response.ok) {
                throw new Error('Failed to create comment');
            }
            const newComment = await response.json();
            setCards(cards.map(card => card.id === cardId ? { ...card, comments: [...card.comments, newComment] } : card));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="go-back" onClick={() => navigate('/')}>
                <RiArrowGoBackFill />
            </div>
            <div className="header">
                <h1>Kudoboard</h1>
            </div>
            <p className="title">{props.title}</p>
            <p>By: {props.author}</p>
            <button onClick={openModal}>Create a Card</button>

            {newCardModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="close" onClick={closeModal}>
                            <IoMdClose />
                        </div>
                        <p>Create a Card</p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = {
                                    title: e.target.title.value,
                                    description: e.target.description.value,
                                    gif: selectedGif,
                                    author: e.target.author.value,
                                };
                                createCard(formData);
                            }}
                        >
                            <input type="text" name="title" placeholder="Card title" required />
                            <input type="text" name="description" placeholder="Card description" required />
                            <input type="text" name="searchQuery" placeholder="Search for a gif..." onChange={handleChange} value={searchQuery} />

                            {gifs && (
                                <div className="gif-grid">
                                    {gifs.map((gif) => (
                                        <img
                                            key={gif.id}
                                            src={gif.images.fixed_height.url}
                                            alt={gif.title}
                                            onClick={() => handleGifClick(gif.images.original.url)}
                                            className={selectedGif === gif.images.original.url ? 'selected' : ''}
                                        />
                                    ))}
                                </div>
                            )}

                            <input type="text" name="author" placeholder="Card author (optional)" />
                            <button type="submit">Create Card</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card-list">
                {Array.isArray(cards) && cards?.map((card) => (
                    card && (
                    <div key={card.id}>
                        <div className="card">
                            <p>Title: {card.title}</p>
                            <p>Description: {card.description}</p>
                            <p>Author: {card.author}</p>
                            <img src={card.gif} alt={card.title} onClick={() => openComments(card.id)}/>
                            <div className="upvote-section">
                                <button onClick={() => upvoteCard(card.id)}>Upvote</button>
                                <span>{card.upvotes} Upvotes</span>
                            </div>
                            <button className="delete-button" onClick={() => deleteCard(card.id)}>Delete</button>
                        </div>
                        <div>
                            {isCommenting && activeCardId === card.id && (
                                <div className="comments">
                                    <IoMdClose className="close" onClick={closeComments} />
                                    <h2>Comments</h2>
                                    <div>
                                        {card.comments?.map((comment) => (
                                            <div key={comment.id} className="comment">{comment.message}</div>
                                        ))}
                                    </div>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = {
                                                message: e.target.message.value,
                                            };
                                            submitComment(card.id, formData);
                                        }}>
                                        <input className="comment-input" type="text" name="message" placeholder="Leave a comment..." required />
                                        <button type="submit" className="comment-button">Submit</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                    )
                ))}
            </div>

            <footer className="footer">
                <p>© 2024 Kudoboard</p>
                <p>Contact us: <a href="mailto:support@kudoboard.com">support@kudoboard.com</a> | Phone: <a href="tel:+1234567890">+1 (123) 456-7890</a></p>
                <p>Follow us:
                <a href="https://nowhere.com/kudoboard">Facebook</a> |
                <a href="https://nowhere.com/kudoboard">Twitter</a> |
                <a href="https://nowhere.com/kudoboard">Instagram</a>
                </p>
            </footer>
        </div>
    );
}

BoardPage.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
};

export default BoardPage;
