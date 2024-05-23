import React from 'react';

function Square(props) {
    const pintar = () => {
        let toReturn;
        switch(props.value) {
            case '_':
                toReturn = "square";
                break;
            case '#':
                toReturn = "square bloque";
                break;
            case 'X':
                toReturn = "square cruz";
                break;
        }

        return toReturn;
    };

    return (
        <button className={pintar()} onClick={props.onClick}>
        </button>
    );
}

export default Square;
