:- module(proylcc,
	[  
		put/8
	]).

:-use_module(library(lists)).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% replace/5 = reemplazar un elemento en una lista por otro elemento en un índice específico.
% CB: cuando el índice es 0, reemplaza el elemento X por Y en la cabeza de la lista.
replace(X, 0, Y, [X|Xs], [Y|Xs]).

% CR: recorrer la lista hasta encontrar el elemento en el índice especificado. 
% Una vez encontrado, reemplaza el elemento y continúa construyendo la lista resultante.
replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% put/8


put(Content, [RowN, ColN], PistasFilas, PistasColumnas, Grilla, NewGrilla, RowSat, ColSat):-
	%reemplaza la fila número RowN de la matriz Grilla con una nueva fila NewRow, y el resultado se almacena en NewGrilla.
	replace(Row, RowN, NewRow, Grilla, NewGrilla),
	
	% verifica si la celda especificada ([RowN, ColN]) está vacía o contiene un Content. Si está vacía, la reemplaza con el Content.
	(replace(Celda, ColN, _, Row, NewRow), Celda == Content ; replace(_Celda, ColN, Content, Row, NewRow)),

	nth0(RowN, PistasFilas, ListaFila),nth0(RowN, NewGrilla, GrillaFila),
	checkear(ListaFila, GrillaFila, RowSat),

	nth0(ColN, PistasColumnas, ListaColumna),
	getCol(NewGrilla, ColN, GrillaCol),
	checkear(ListaColumna, GrillaCol, ColSat).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% obtenerColumna(+Grilla, +IndiceColumna, -ColumnaResultado).
%
% ColumnaResultado es la lista obtenida de colocarle el elemento de indice IndiceColumna de cada lista

getCol([], _, []).
getCol([X | Xs], ColN, [Elemento | ListaColumna]):-
	% Obtengo con nth0 el elemento que le corresponde a la columna de esa fila
	nth0(ColN, X, Elemento),
	getCol(Xs, ColN, ListaColumna).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% checkear(+Pistas, +ListaEnFormatoPistas, -Satisface).
%
% Satisface se consigue de comparar las dos listas, dando 1 si son iguales o 0 si no lo son

checkear(Pistas, ListaGrilla, 1):-
	convertir(ListaGrilla, ListaGrillaPista, 0),
	Pistas = ListaGrillaPista.

checkear([0], ListaGrilla, 1):-
	convertir(ListaGrilla, ListaGrillaPista, 0),
	% Como la lista convertida con ninguna marcada es una lista vacía: [0]
	ListaGrillaPista = [].
checkear(_, _, 0).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% convertir/3
% Leidos: marcados que viene leyendo sin encontrar un espacio o cruz

convertir([], [], 0).
% CB: si es una lista vacía y no vió ningún marcado antes, entonces no tiene marcados
convertir([], [Leidos], Leidos):-
	% CB: si la lista está vacía y vio marcados antes, entonces tiene esa cantidad de marcados seguidos
	Leidos > 0.


convertir([X | Xs], Ys, 0):-
	% CR: si lee una X o un vacío sin leer ningún marcado antes, entonces hay tantos marcados como tenga el resto de la lista
	(var(X);X="X"),
	convertir(Xs, Ys, 0).
convertir([X | Xs], [Leidos | Ys], Leidos):-
	% CR: si lee una X o un vacío pero leyó algún marcado antes, entonces hay tantos marcados como leyó seguido de los que le quedan a la lista
	(var(X);X="X"),
	Leidos > 0,
	convertir(Xs, Ys, 0).
convertir([X | Xs], Ys, Leidos):-
	% CR: si lee un marcado, entonces hay un marcado mas seguido de los que le quedan a la lista
    not(var(X);X="X"),
	LeidosAux is Leidos + 1,
	convertir(Xs, Ys, LeidosAux).





%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% checkAll/7
% Checkea todas las filas y columnas de la grilla, siendo FilaSatL la lista de resultados de checkear las filas, y ColSatL de checkear las columnas

checkAll(Grilla, PistasFilas, FilaSatL, FilasTotales, PistasColumnas, ColSatL, ColumnasTotales):-
	checkAllRec(Grilla, FilaSatL, PistasFilas, 0, FilasTotales, ColSatL, PistasColumnas, 0, ColumnasTotales).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% checkearAllRec/9
% Recorre cada fila y columna hasta que las lee completamente (eso es, su indice es el total - 1)

checkAllRec(_, [], _, IndiceF, FilasTotales, [], _, IndiceC, ColumnasTotales):-
	% Caso base: una grilla vacía tiene filas y columnas satisfechas vacías.
	IndiceF is FilasTotales,
	IndiceC is ColumnasTotales.

	checkAllRec(Grilla, [F | FilaSatL], PistasFilas, IndiceF, FilasTotales, [C | ColSatL], PistasColumnas, IndiceC, ColumnasTotales):-
	% Caso recursivo: una grilla no vacía tiene una columna y fila que checkear, y una grilla mas pequeña que tiene que checkear
	not(IndiceF is FilasTotales),
	not(IndiceC is ColumnasTotales),
	nth0(IndiceF, PistasFilas, ListaFila),
	nth0(IndiceF, Grilla, GrillaFila),
	checkear(ListaFila, GrillaFila, F),
	IndiceFNuevo is IndiceF + 1,

	nth0(IndiceC, PistasColumnas, ListaColumna),
	getCol(Grilla, IndiceC, GrillaCol),
	checkear(ListaColumna, GrillaCol, C),
	IndiceCNuevo is IndiceC + 1,

	checkAllRec(Grilla, FilaSatL, PistasFilas, IndiceFNuevo, FilasTotales, ColSatL, PistasColumnas, IndiceCNuevo, ColumnasTotales).

	checkAllRec(Grilla, FilaSatL, PistasFilas, IndiceF, FilasTotales, [C | ColSatL], PistasColumnas, IndiceC, ColumnasTotales):-
	% El mismo caso recursivo, pero no tiene filas que checkear 
	not(IndiceC is ColumnasTotales),
	IndiceF is FilasTotales,
	nth0(IndiceC, PistasColumnas, ListaColumna),
	getCol(Grilla, IndiceC, GrillaCol),
	checkear(ListaColumna, GrillaCol, C),
	IndiceCNuevo is IndiceC + 1,

	checkAllRec(Grilla, FilaSatL, PistasFilas, IndiceF, FilasTotales, ColSatL, PistasColumnas, IndiceCNuevo, ColumnasTotales).

	checkAllRec(Grilla, [F | FilaSatL], PistasFilas, IndiceF, FilasTotales, ColSatL, PistasColumnas, IndiceC, ColumnasTotales):-
	% El mismo caso recursivo, pero no tiene columnas que checkear
	not(IndiceF is FilasTotales),
	IndiceC is ColumnasTotales,
	nth0(IndiceF, PistasFilas, ListaFila),
	nth0(IndiceF, Grilla, GrillaFila),
	checkear(ListaFila, GrillaFila, F),
	IndiceFNuevo is IndiceF + 1,

	checkAllRec(Grilla, FilaSatL, PistasFilas, IndiceFNuevo, FilasTotales, ColSatL, PistasColumnas, IndiceC, ColumnasTotales).
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%