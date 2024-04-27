/*import React from 'react';
import styles from './index.css'; // Import CSS Module

function Clue(props) {
    const clueColor = () => {
           return props.valid === 1 ? styles.clueCompleted : styles.clue;
    }
    return (
        <div className={clueColor()}>
            {props.clue.map((num, i) =>
                <div key={i}>
                    {num}
                </div>
            )}
        </div>
    );
}

export default Clue;
*/

import React from 'react';

class Clue extends React.Component {

    clueColor(){
        var toReturn;
        toReturn= (this.props.valid === 1 ? "clueCompleted" : "clue");

        return toReturn;
    }

    render() {
        const clue = this.props.clue;
        return (
            <div className={this.clueColor()} >
                {clue.map((num, i) =>
                    <div key={i}>
                        {num}
                    </div>
                )}
            </div>
        );
    }
}

export default Clue;
