import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
import Clue from './Clue';
import gameWonVideo from './endGif.gif'; // Importa el video
import botonX from './clave.png'; 
import botonY from './bateria.png'; 
import botonZ from './closedEye.png'
import botonZO from './openedEye.png'

let pengine;
let content = 'X';
let buttonHistorial = 'X';
// Define a function to solve the entire grid

function Game() {

  const [grid, setGrid] = useState(null);
  const [rowsClues, setRowsClues] = useState([]);
  const [colsClues, setColsClues] = useState([]);
  const [activeButton, setActiveButton] = useState('button1'); 
  const [gameEnded, setGameEnded] = useState(false);
  const [rowColor, setRowColor] = useState([]);
  const [colColor, setColColor] = useState([]);
  const [solvedGrid, setSolvedGrid] = useState(false);
  const [button3Image, setButton3Image] = useState(botonZ); // Estado para la imagen del button3

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

  function solveGrid() {
     // Build Prolog query to make a move and get the new satisfacion status of the relevant clues.    

     console.log('Entré a solvedGrid');

     const queryS = `go(ResGrid)`;

     pengine.query(queryS, (success, response) => {
        if (success) {
          console.log('entre a succes de solvedGrid');
          setSolvedGrid(response['ResGrid']);
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
            // 
            const squaresS = JSON.stringify(grid).replaceAll('"_"', "_"); 
            const filaS = JSON.stringify(rowsClues);
            const colS = JSON.stringify(colsClues);
            queryS = 'checkAll(' + squaresS + ', ' + filaS + ', FilaSatL, '
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
  // Si solvedGrid está disponible y la celda está vacía en la cuadrícula actual, revelar el carácter correcto
  if (solvedGrid && grid[i][j] === '_') {
    console.log('Entre aqui');
    let correctCharacter = solvedGrid[i][j];
    const newGrid = [...grid]; // Make a copy of the grid state
    console.log(correctCharacter); // 1 if it's painted and 0 if it's X
    //newGrid[i][j] = correctCharacter === 1 ? '#' : 'X'; 
   // setGrid(newGrid); // Actualiza el estado de la cuadrícula
   content = correctCharacter === 1 ? '#' : 'X';
  }
    // Si solvedGrid no está disponible o la celda no está vacía, realiza la consulta al servidor para colocar el carácter
    // Esto se hace de manera similar a como lo estás haciendo actualmente en esta función
    const squaresS = JSON.stringify(grid).replaceAll('"_"', '_');
    const rowsCluesS = JSON.stringify(rowsClues);
    const colsCluesS = JSON.stringify(colsClues);
    const queryS = `put("${content}", [${i},${j}], ${rowsCluesS}, ${colsCluesS}, ${squaresS}, ResGrid, RowSat, ColSat)`;
    pengine.query(queryS, (success, response) => {
      if (success) {
        const rowColorAux = rowColor.slice();
        const colColorAux = colColor.slice();
        rowColorAux[i] = response['RowSat'];
        colColorAux[j] = response['ColSat'];
        setGrid(response['ResGrid']);
        setRowColor(rowColorAux);
        setColColor(colColorAux);
        setSolvedGrid(false);
        handleButtonClick(buttonHistorial);
        setButton3Image(botonZ);
      }
    });
  }

  function handleButtonClick(buttonId) {
    // If the "Solve" button is clicked, solve the entire grid
    if (buttonId === 'button3') {
      solveGrid();
      setButton3Image(botonZO);
  }

  // If the "X" or "#" button is clicked, set the content accordingly
    else {
        content = buttonId === 'button1' ? 'X' : '#';
        setActiveButton(buttonId);
        buttonHistorial = buttonId;
    }
  }  

  if (!grid) {
    return null;
  }

  
  return (
    <div className="game">
      {/* Your grid rendering logic here... */}
      {(!colColor.includes(0) && !rowColor.includes(0) && colColor[0] != null) ? (
        // <div className="game-ended">Game Over! You Won!</div>
        <img src={gameWonVideo} alt="You won!" /> // Muestra la imagen cuando el juego termina
      ) : (    
        <> 
          <Board
            grid={grid}
            rowsClues={rowsClues}
            colsClues={colsClues}
            colColor={colColor}
            rowColor={rowColor}
            onClick={(i, j) => handleClick(i, j)}
          />
          <div className="button-container">
            {/* Your existing buttons */}
            <div className="buttons">
              {/* Switch button */}                         
              <button 
                className={`button ${activeButton === 'button1' ? 'active' : ''}`} 
                onClick={() => handleButtonClick('button1')}
                style={{ width: '50px', height: '50px' }}
              >
                <img 
                  src={botonX} 
                  alt="Descripción de la imagen" 
                  style={{ height: '100%' }}
                />
              </button>
  
              <button 
                className={`button ${activeButton === 'button2' ? 'active' : ''}`} 
                onClick={() => handleButtonClick('button2')}
                style={{ width: '50px', height: '50px' }}
              >
                <img 
                  src={botonY} 
                  alt="Descripción de la imagen" 
                  style={{ height: '100%' }}
                />
              </button>
  
              {/* Button 3 */}
              <circleButton className="button" onClick={() => handleButtonClick('button3')
                
              }
                style={{ width: '50px', height: '50px' }}
              >
                <img 
                  src={button3Image} 
                  alt="Descripción de la imagen" 
                  style={{ height: '100%' }}
                />
              </circleButton>
            </div>
            {/* End of button container */}
          </div>
        </>
      )}
    </div>
  );  
}  
export default Game;

