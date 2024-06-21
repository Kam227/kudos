import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/Board.css';

const Board = (props) => {
    return (
        <div className="board">
            <div className="info">
                <img className="image" src={props.image ? props.image : "./placeholder-image.jpg"} />
                <p>{props.title}</p>
                <p>{props.category}</p>
            </div>
            <div className="button">
                <button onClick={props.onOpen}>View Board</button>
                <button onClick={props.onDelete}>Delete Board</button>
            </div>
        </div>
    )
}

Board.propTypes = {
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    onOpen: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
}

export default Board;
