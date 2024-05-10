import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
import gameWonVideo from './End.png'; // Importa el video
import startGameImage from './startBackground.png'; // Importa el video
import startButtonImage from './startButton.png'; // Replace with your image path
import botonX from './clave.png'; 
import botonY from './bateria.png'; 
import botonZ from './closedEye.png'
import botonZO from './openedEye.png'


let pengine;
let content = 'X';
let buttonHistorial = 'X';

function Game() {

  const [grid, setGrid] = useState(null);
  const [rowsClues, setRowsClues] = useState([]);
  const [colsClues, setColsClues] = useState([]);
  const [activeButton, setActiveButton] = useState('button1'); 
  const [rowColor, setRowColor] = useState([]);
  const [colColor, setColColor] = useState([]);
  const [solvedGrid, setSolvedGrid] = useState(false);
  const [button3Image, setButton3Image] = useState(botonZ); 
  const [showStartImage, setShowStartImage] = useState(true); 


  useEffect(() => {
    PengineClient.init(handleServerReady);
    // eslint-disable-next-line
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

  function solveGrid() {
   const queryS = 'go(Grid)';
    pengine.query(queryS, (success, response) => {
        if (success) {
            setSolvedGrid(response['Grid']);
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
    const newGrid = [...grid]; // copia del estado de la grilla
    console.log(correctCharacter); // 1 si es #, 0 si es X
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
  // Si el boton Solve se clickea, soluciona la grilla.
    if (buttonId === 'button3') {
      solveGrid();
      setButton3Image(botonZO);
  }
  // Si se clickea X o #, se setea el contenido que corresponde
    else {
        content = buttonId === 'button1' ? 'X' : '#';
        setActiveButton(buttonId);
        buttonHistorial = buttonId;
    }
  }  

  function handleCloseStartImage() {
    setShowStartImage(false); // Cierra la imagen de inicio al presionar el botón
  }

  if (!grid) {
    return null;
  }

  return (
    <div className="game">
      {showStartImage && ( // Mostrar la imagen de inicio solo si showStartImage es verdadero
        <div className="start-image-overlay">
          <img src={startGameImage} alt="Start Game" />
          <circleButton className="start-button" onClick={() => handleCloseStartImage()
              }
                style={{ width: '50px', height: '50px' }}
              >
                <img 
                  src={startButtonImage} 
                  alt="Descripción de la imagen" 
                  style={{ height: '100%' }}
                />
              </circleButton>
        </div>
      )}
      {(!colColor.includes(0) && !rowColor.includes(0) && colColor[0] != null) ? (
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
            <div className="buttons">             
              <button //Button X
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
              <button //Button # 
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
              {/* Button Solucionador */}
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
          </div>
        </>
      )}
    </div>
  );  
}  
export default Game;

