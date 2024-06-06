import React from 'react';
import Square from './Square';
import Clue from './Clue';

function Board({ grid, rowsClues, colsClues,colColor,rowColor,onClick, gridDisabled}) {
    const numOfRows = grid.length;
    const numOfCols = grid[0].length;
    const translucentStyle = gridDisabled ? { opacity: 0.5} : {};

    return (
        <div className="vertical">
            <div
                className="colClues"
                style={{
                    gridTemplateRows: '70px',
                    gridTemplateColumns: `71px repeat(${numOfCols}, 70px)`,
                    /*
                       60px  40px 40px 40px 40px 40px 40px 40px   (gridTemplateColumns)
                      ______ ____ ____ ____ ____ ____ ____ ____
                     |      |    |    |    |    |    |    |    |  60px
                     |      |    |    |    |    |    |    |    |  (gridTemplateRows)
                      ------ ---- ---- ---- ---- ---- ---- ---- 
                     */
                      ...translucentStyle
                }}
            >
                <div>{/* top-left corner square */}</div>
                {colsClues.map((clue, i) =>
                     <Clue clue={clue} key={i} valid ={colColor[i]}/>
                )}
            </div>
            <div className="horizontal">
                <div
                    className="rowClues"
                    style={{
                        gridTemplateRows: `repeat(${numOfRows}, 70px)`,
                        gridTemplateColumns: '70px',       
                        ...translucentStyle                
                    }}
                >
                    {rowsClues.map((clue, i) =>
                        <Clue clue={clue} key={i} valid={rowColor[i]} />
                    )}
                </div>
                <div className="board"
                    style={{
                        gridTemplateRows: `repeat(${numOfRows}, 70px)`,
                        gridTemplateColumns: `repeat(${numOfCols}, 70px)`
                    }}>
                    {grid.map((row, i) =>
                        row.map((cell, j) =>
                            <Square
                                value={cell}
                                onClick={() => !gridDisabled && onClick(i, j)}
                                key={i + j}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default Board;