import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
import gameWonVideo from './End.png'; // Importa el video
import startGameImage from './startBackground.png'; // Importa el video
import startButtonImage from './startButton.png'; // Replace with your image path
import clickSound from './jazzRide.mp3';
import clickSoundChorus from './choir.mp3';
import clickSoundPiano from './piano.mp3';
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
  const [activeButton, setActiveButton] = useState('button2'); 
  const [rowColor, setRowColor] = useState([]);
  const [colColor, setColColor] = useState([]);
  const [solvedGrid, setSolvedGrid] = useState(false);
  const [solvedBool, setSolvedBool] = useState(false);
  const [button3Image, setButton3Image] = useState(botonZ); 
  const [showStartImage, setShowStartImage] = useState(true); 
  const [button4Image, setButton4Image] = useState(botonSO); 
  const [isActive4, setIsActive4] = useState(false);
  const [isActive3, setIsActive3] = useState(false);
  const [isActive2, setIsActive2] = useState(false);
  const [isActive1, setIsActive1] = useState(false);
  const [originalGrid, setOriginalGrid] = useState(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false); 
  const [gridDisabled, setGridDisabled] = useState(false);
  const [previousActiveButton, setPreviousActiveButton] = useState('button2');

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
  if (solvedBool && grid[i][j] === '_') {
    let correctCharacter = solvedGrid[i][j];
    const newGrid = [...grid];
    content = correctCharacter;
  }

  if (solvedBool && (grid[i][j] === 'X' || grid[i][j] === '#')) {
    return;
  } else {
    soundPlayer(content,solvedBool);
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
        setActiveButton(previousActiveButton);
        setButton3Image(botonZ);
        setButton4Image(botonSO);
      }
    });
  }
}

  function soundPlayer(content,solvedBool){
    if (solvedBool){
      new Audio(clickSoundChorus).play();
    }
    else if(content  ===  'X'){
      new Audio(clickSound).play();
    }
    else new Audio(clickSoundPiano).play();
  }

  function handleButtonClick(buttonId) { 
  // Si el boton SolveCelda se clickea, soluciona la celda.
    if (buttonId === 'button3') {
      if(!isActive4){
        if(!isActive3){
        setPreviousActiveButton(activeButton); // Guardar el botón activo actual
        setSolvedBool(true);
        setButton3Image(botonZO);
        }
        else{
          setActiveButton(previousActiveButton); // Restaurar el botón activo
          setSolvedBool(false);
          setButton3Image(botonZ);
        }
      }
  }
  else{
  if(solvedBool){
    console.log("asdasd");
    setIsActive3(!isActive3);
    setSolvedBool(false);
    setButton3Image(botonZ);
    }

  if (buttonId === 'button4') {
  if(!isActive4){
    setPreviousActiveButton(activeButton); // Guardar el botón activo actual
    setButton4Image(botonS);
    setOriginalGrid(grid);
    setGrid(solvedGrid); // Muestra la grilla resuelta
    setGridDisabled(true); // Disable grid interactions
    setIsActive1(isActive1);
    setIsActive2(isActive2);
    if(isActive3)
    setIsActive3(!isActive3);
  }else{
    setButton4Image(botonSO);
    setGrid(originalGrid); // Restaurar la grilla original
    setGridDisabled(false); // Set grid to enabled state
    setIsActive4(!isActive4);
    setIsActive1(!isActive1);
    setIsActive2(!isActive2);
    setActiveButton(previousActiveButton); // Restaurar el botón activo
  }
}
  // Si se clickea X o #, se setea el contenido que corresponde
    else {
      if(!isActive4){
        content = buttonId === 'button1' ? 'X' : '#';
        setActiveButton(buttonId);
        buttonHistorial = buttonId;
      }
    }
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
              <div className="button-container">
                <div className="buttons">             
                  {/* Button Solucionador de celda */}
                  <circleButton 
                  className={`button ${isActive3 ? 'active' : ''}`}
                  onClick={() => {
                    setActiveButton('');
                    if(!isActive4)
                      setIsActive3(!isActive3);
                    handleButtonClick('button3');
                  }
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
                    className={`buttonIdea ${isActive4 ? 'active' : ''}`}
                    onClick={() => {
                      setActiveButton('');
                      setIsActive4(!isActive4);
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
              <Board
                grid={grid}
                rowsClues={rowsClues}
                colsClues={colsClues}
                colColor={colColor}
                rowColor={rowColor}
                onClick={(i, j) => handleClick(i, j)}
                gridDisabled={gridDisabled}
                className={`board ${isActive4 ? 'active' : ''}`}
              />
              <div className="button-container">
                <div className="buttons">             
                  <button //Button X
                    className={`button ${activeButton === 'button1' ? 'active' : ''}`} 
                    onClick={() => {
                      handleButtonClick('button1');
                      //setIsActive1(!isActive1);
                    }
                    }
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
                    onClick={() => {
                      handleButtonClick('button2');
                      //setIsActive2(!isActive2);
                    }
                    }
                    style={{ width: '50px', height: '50px' }}
                  >
                    <img 
                      src={botonY} 
                  alt="Descripción de la imagen" 
                  style={{ height: '100%' }}
                />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );  
}  
export default Game;

