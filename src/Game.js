import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
export const imageMapping = {
  'X': './clave.png',
  '#': './bateria.png',
};

let pengine;
let content = 'X';

function Game() {

  const [grid, setGrid] = useState(null);
  const [rowsClues, setRowsClues] = useState([]);
  const [colsClues, setColsClues] = useState([]);
 // const [waiting, setWaiting] = useState(false);
  const [activeButton, setActiveButton] = useState('button1'); 
  const [gameEnded, setGameEnded] = useState(false);
  const [rowColor, setRowColor] = useState([]);
  const [colColor, setColColor] = useState([]);

  useEffect(() => {

    PengineClient.init(handleServerReady);
    // eslint-disable-next-line
  }, []);

  function handleServerReady(instance) {
    console.log("Comienza El programa!");
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
            const squaresS = JSON.stringify(grid).replaceAll('"_"', "_"); 
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

    // Build Prolog query to make a move and get the new satisfacion status of the relevant clues.    
    const squaresS = JSON.stringify(grid).replaceAll('"_"', '_'); //Remove quotes for variables. squares = [["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]]
    const rowsCluesS = JSON.stringify(rowsClues); 
    const colsCluesS = JSON.stringify(colsClues);
    const queryS = `put("${content}", [${i},${j}], ${rowsCluesS}, ${colsCluesS}, ${squaresS}, ResGrid, RowSat, ColSat)`; // queryS = put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)

    pengine.query(queryS, (success, response) => {
       if (success) {
        const rowColorAux = rowColor.slice();
        const colColorAux = colColor.slice();
        rowColorAux[i] = response['RowSat'];
        colColorAux[j] = response['ColSat'];
            setGrid(response['ResGrid']);
            setRowColor(rowColorAux);
            setColColor(colColorAux);
      }
    }
  );
}



  function handleButtonClick(buttonId) {
    console.log(`Button ${buttonId} clicked`);
    content = buttonId === 'button1' ? 'X' : '#';
    setActiveButton(buttonId);
  }  

  if (!grid) {
    return null;
  }

  
  // Renderización normal del juego si no ha terminado
  return (
    <div className="game">
      {/* Your grid rendering logic here... */}
      {(!colColor.includes(0) && !rowColor.includes(0) && colColor[0] != null) ? (
        <div className="game-ended">Game Over! You Won!</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}  
export default Game;

