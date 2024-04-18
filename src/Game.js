import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';

let pengine;
let content = 'X';

function Game() {

  // State
  const [grid, setGrid] = useState(null);
  const [rowsClues, setRowsClues] = useState(null);
  const [colsClues, setColsClues] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [activeButton, setActiveButton] = useState('button1'); 
  const [gameEnded, setGameEnded] = useState(false);
  const [rowColor, setRowColor] = useState([]);
  const [colColor, setColColor] = useState([]);

  useEffect(() => {

    // Creation of the pengine server instance.    
    // This is executed just once, after the first render.    
    // The callback will run when the server is ready, and it stores the pengine instance in the pengine variable. 
    PengineClient.init(handleServerReady);
  }, []);

  function handleServerReady(instance) {
    pengine = instance;
    const queryS = 'init(RowClues, ColumClues, Grid)';
    pengine.query(queryS, (success, response) => {
      if (success) {
        setGrid(response['Grid']);
        setRowsClues(response['RowClues']);
        setColsClues(response['ColumClues']);
        loadGrid(0);
      }
    });
  }


  function loadGrid(n) {
    let queryS = 'init( PistasFilas, PistasColumns, Grilla)';
    pengine.query(queryS, (success, response) => {
        if (success) {
            setGrid(response['Grilla']);
            setRowsClues(response['PistasFilas']);
            setColsClues(response['PistasColumns']);

            // Checkea todas las pistas para saber si alguna está completa
            // checkearTodas([["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], 
            //                  [[3], [1, 2], [4], [5], [5]], FilaSatL, 5, [[2], [5], [1,3], [5], [4]], ColSatL, 5)
            const squaresS = JSON.stringify(grid).replaceAll('"_"', "_"); // Remove quotes for variables.
            const filaS = JSON.stringify(rowsClues);
            const colS = JSON.stringify(colsClues);
            queryS = 'checkearTodos(' + squaresS + ', ' + filaS + ', FilaSatL, '
                + rowsClues.length + ', ' + colS + ', ColSatL, ' + colsClues.length + ')';

            pengine.query(queryS, (success, response) => {
                if (success) {
                    setRowColor(response['FilaSatL']);
                    setColColor(response['ColSatL']);
                }
            });
        }
    });
}




  function handleClick(i, j) {
    // No action on click if we are waiting.
    if (waiting) {
      return;
    }
  let newContent;
  if (grid[i][j] === '#') {
    newContent = '_'; // If the square contains '#', set the new content to '_'
  } else {
    newContent = content; // Otherwise, use the current content
  }
    // Build Prolog query to make a move and get the new satisfacion status of the relevant clues.    
    const squaresS = JSON.stringify(grid).replaceAll('"_"', '_'); //Remove quotes for variables. squares = [["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]]
    const rowsCluesS = JSON.stringify(rowsClues);
    const colsCluesS = JSON.stringify(colsClues);
    const queryS = `put("${content}", [${i},${j}], ${rowsCluesS}, ${colsCluesS}, ${squaresS}, ResGrid, RowSat, ColSat)`; // queryS = put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
    setWaiting(true);
    pengine.query(queryS, (success, response) => {
       if (success) {
        const rowColorAux = rowColor.slice();
        const colColorAux = colColor.slice();
        rowColorAux[i] = response['FilaSat'];
        colColorAux[j] = response['ColSat'];
            setGrid(response['ResGrid']);
            setRowColor(rowColorAux);
            setColColor(colColorAux);
            setWaiting(false);
            checkGameEnd();
      }
    else {
        setWaiting(false);
      }}
  );}

  function checkGameEnd() {
    const isCompleted = (!colColor.includes(0) && !rowColor.includes(0) && colColor[0] != null);
    setGameEnded(isCompleted);
  }

  function handleButtonClick(buttonId) {
    console.log(`Button ${buttonId} clicked`);
    content = buttonId === 'button1' ? 'X' : '#';
    setActiveButton(buttonId);
  }  

  if (!grid) {
    return null;
  }

  if (gameEnded) {
    return (
      <div className="game">
        <div className="game-ended">Game Over! You Won!</div>
      </div>
    );
  }
  
  // Renderización normal del juego si no ha terminado
  return (
    <div className="game">
      <Board
        grid={grid}
        rowsClues={rowsClues}
        colsClues={colsClues}
        onClick={(i, j) => handleClick(i, j)}
      />
      <div className="buttons">
        <button className={`button ${activeButton === 'button1' ? 'active' : ''}`} onClick={() => handleButtonClick('button1')}>X</button>
        <button className={`button ${activeButton === 'button2' ? 'active' : ''}`} onClick={() => handleButtonClick('button2')}>#</button>
      </div>
    </div>
  );
}
export default Game;


