import React from 'react';

function Square({ value, onClick }) {
    return (
        <button className="square" onClick={onClick} style={{ color: value === 'X' ? 'red' : 'blue' }}>
            {value !== '_' ? value : null}
        </button>
    );
}

export default Square;