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
import botonS from './lightOn.png'
import botonSO from './lightOff.png'


let pengine;
let content = '#';
let buttonHistorial = '#';

function Game() {

  const [grid, setGrid] = useState(null);
  const [rowsClues, setRowsClues] = useState([]);
  const [colsClues, setColsClues] = useState([]);
  const [activeButton, setActiveButton] = useState('button1'); 
  const [rowColor, setRowColor] = useState([]);
  const [colColor, setColColor] = useState([]);
  const [solvedGrid, setSolvedGrid] = useState(false);
  const [solvedBool, setSolvedBool] = useState(false);
  const [button3Image, setButton3Image] = useState(botonZ); 
  const [showStartImage, setShowStartImage] = useState(true); 
  const [button4Image, setButton4Image] = useState(botonSO); 
  const [isActive, setIsActive] = useState(false);
  const [originalGrid, setOriginalGrid] = useState(null);


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
        setOriginalGrid(response['Grid']);
      }
    });
    const querySs = 'go(GridR)';
    pengine.query(querySs, (success, response) => {
        if (success) {
            setSolvedGrid(response['GridR']);
            setSolvedBool(true);
        }
      });
    }
  
  function loadGrid() {
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
  if (solvedBool && solvedGrid && grid[i][j] === '_') {
    console.log('Entre aqui');
    let correctCharacter = solvedGrid[i][j];
    const newGrid = [...grid]; // copia del estado de la grilla
    content = correctCharacter;
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
        setSolvedBool(false);
        handleButtonClick(buttonHistorial);
        setButton3Image(botonZ);
        setButton4Image(botonS);
      }
    });
  }

  function handleButtonClick(buttonId) {
  // Si el boton SolveCelda se clickea, soluciona la grilla.
    if (buttonId === 'button3') {
      setSolvedBool(true);
      setButton3Image(botonZO);
  }
  // Si se clickea el boton solverGrilla
 // Si se clickea el boton solverGrilla
 else if (buttonId === 'button4') {
  if(isActive){
    console.log(solvedGrid);
    setButton4Image(botonS);
    setOriginalGrid(grid);
    setGrid(solvedGrid); // Muestra la grilla resuelta
  }else{
    setButton4Image(botonSO);
    setGrid(originalGrid); // Restaurar la grilla original
  }
}
  // Si se clickea X o #, se setea el contenido que corresponde
    else {
        content = buttonId === 'button1' ? 'X' : '#';
        setActiveButton(buttonId);
        buttonHistorial = buttonId;
    }
  }

  function translateGrid(grid) {
    return grid.map(row => row.map(cell => cell === 1 ? '#' : 'X'));
  }  

  // Cierra la imagen de inicio al presionar el botón que se habilita cuando la grilla esta resuelta
  function handleCloseStartImage() {
    if (solvedBool){
    setShowStartImage(false); 
    loadGrid(); 
    let tGrid = translateGrid(solvedGrid);
    setSolvedGrid(tGrid);
    }
    setSolvedBool(false);
  }

  if (!grid) {
    return null;
  }

  return (
<div className="game">
    {showStartImage && ( // Mostrar la imagen de inicio solo si showStartImage es verdadero
    <div className="start-image-overlay">
    <img src={startGameImage} alt="Start Game" />
    <div className="startButton-container">
      <circleButton className="start-button" onClick={() => handleCloseStartImage()} style={{ width: '80px', height: '80px' }}>
        <img src={startButtonImage} alt="Descripción de la imagen" style={{ height: '140%', width: '140%' }} />
      </circleButton>
    </div> 
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
              <circleButton
                className={`buttonIdea ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setIsActive(!isActive);
                  handleButtonClick('button4'); 
                }}
                style={{ width: '50px', height: '50px' }}
              >
                <img 
                  src={button4Image} 
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

