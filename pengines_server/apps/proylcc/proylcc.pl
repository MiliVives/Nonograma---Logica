:- module(proylcc,
	[  
		put/8
	]).

:-use_module(library(lists)).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% replace(?X, +XIndex, +Y, +Xs, -XsY)
%
% XsY es el resultado de reemplazar la ocurrencia de X en la posición XIndex de Xs por Y.

replace(X, 0, Y, [X|Xs], [Y|Xs]).

replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% put(+Contenido, +Pos, +PistasFilas, +PistasColumnas, +Grilla, -GrillaRes, -FilaSat, -ColSat).
%

put(Contenido, [RowN, ColN], PistasFilas, PistasColumnas, Grilla, NewGrilla, FilaSat, ColSat):-
	% NewGrilla es el resultado de reemplazar la fila Row en la posición RowN de Grilla
	% (RowN-ésima fila de Grilla), por una fila nueva NewRow.
	
	replace(Row, RowN, NewRow, Grilla, NewGrilla),

	% NewRow es el resultado de reemplazar la celda Cell en la posición ColN de Row por _,
	% siempre y cuando Cell coincida con Contenido (Cell se instancia en la llamada al replace/5).
	% En caso contrario (;)
	% NewRow es el resultado de reemplazar lo que se que haya (_Cell) en la posición ColN de Row por Conenido.	 
	
	(replace(Cell, ColN, _, Row, NewRow),
	Cell == Contenido 
		;
	replace(_Cell, ColN, Contenido, Row, NewRow)),

	% Uso nth0 que me permite obtener el elemento de índice específico de una lista para obtener la fila a checkear y su pista correspondiente
	nth0(RowN, PistasFilas, ListaFila),
	nth0(RowN, NewGrilla, GrillaFila),
	checkear(ListaFila, GrillaFila, FilaSat),

	% Hago lo mismo con las columnas, pero necesito obtener la columna de otra forma (ya que es una lista que tiene un elemento de todas las listas)
	nth0(ColN, PistasColumnas, ListaColumna),
	obtenerColumna(NewGrilla, ColN, GrillaCol),
	checkear(ListaColumna, GrillaCol, ColSat).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% obtenerColumna(+Grilla, +IndiceColumna, -ColumnaResultado).
%
% ColumnaResultado es la lista obtenida de colocarle el elemento de indice IndiceColumna de cada lista

obtenerColumna([], _, []).
obtenerColumna([X | Xs], ColN, [Elemento | ListaColumna]):-
	% Obtengo con nth0 el elemento que le corresponde a la columna de esa fila
	nth0(ColN, X, Elemento),
	obtenerColumna(Xs, ColN, ListaColumna).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% checkear(+Pistas, +ListaEnFormatoPistas, -Satisface).
%
% Satisface se consigue de comparar las dos listas, dando 1 si son iguales o 0 si no lo son

checkear(Pistas, ListaGrilla, 1):-
	transformar(ListaGrilla, ListaGrillaPista, 0),
	Pistas = ListaGrillaPista.
checkear([0], ListaGrilla, 1):-
	transformar(ListaGrilla, ListaGrillaPista, 0),
	% Como la lista transformada con ninguna marcada es una lista vacía, la tratamos como si fuese [0]
	ListaGrillaPista = [].
checkear(_, _, 0).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% transformar(+Lista, -ListaEnFormatoPistas, ?Leidos).
%
% ListaEnFormatoPistas es la Lista que le pasaron pero contando los marcados, por ej
% [#, #, _, X, #] es [2, 1]
% Leidos es para pasar cuantos marcados viene leyendo sin encontrar un espacio o cruz

transformar([], [], 0).
% Caso base: si es una lista vacía y no vió ningún marcado antes, entonces no tiene marcados
transformar([], [Leidos], Leidos):-
	% Caso base: si la lista está vacía y vio marcados antes, entonces tiene esa cantidad de marcados seguidos
	Leidos > 0.
transformar([X | Xs], Ys, 0):-
	% Caso Recursivo: si lee una X o un vacío sin leer ningún marcado antes, entonces hay tantos marcados como tenga el resto de la lista
	(var(X);X="X"),
	transformar(Xs, Ys, 0).
transformar([X | Xs], [Leidos | Ys], Leidos):-
	% Caso Recursivo: si lee una X o un vacío pero leyó algún marcado antes, entonces hay tantos marcados como leyó seguido de los que le quedan a la lista
	(var(X);X="X"),
	Leidos > 0,
	transformar(Xs, Ys, 0).
transformar([X | Xs], Ys, Leidos):-
	% Caso Recursivo: si lee un marcado, entonces hay un marcado mas seguido de los que le quedan a la lista
    not(var(X);X="X"),
	LeidosAux is Leidos + 1,
	transformar(Xs, Ys, LeidosAux).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% checkearTodos(+Grilla, +PistasFilas, -FilaSatL, +FilasTotales, +PistasColumnas, -ColSatL, +ColumnasTotales).
%
% Checkea todas las filas y columnas de la grilla, siendo FilaSatL la lista de resultados de checkear las filas, y ColSatL de checkear las columnas

checkearTodos(Grilla, PistasFilas, FilaSatL, FilasTotales, PistasColumnas, ColSatL, ColumnasTotales):-
	checkearTodosAux(Grilla, FilaSatL, PistasFilas, 0, FilasTotales, ColSatL, PistasColumnas, 0, ColumnasTotales).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% checkearTodosAux(+Grilla, +PistasFilas, -FilaSatL, ?IndiceF, +FilasTotales, +PistasColumnas, -ColSatL, ?IndiceC, +ColumnasTotales).
%
% Recorre cada fila y columna hasta que las lee completamente (eso es, su indice es el total - 1)

checkearTodosAux(_, [], _, IndiceF, FilasTotales, [], _, IndiceC, ColumnasTotales):-
	% Caso base: una grilla vacía tiene filas y columnas satisfechas vacías.
	IndiceF is FilasTotales,
	IndiceC is ColumnasTotales.

checkearTodosAux(Grilla, [F | FilaSatL], PistasFilas, IndiceF, FilasTotales, [C | ColSatL], PistasColumnas, IndiceC, ColumnasTotales):-
	% Caso recursivo: una grilla no vacía tiene una columna y fila que checkear, y una grilla mas pequeña que tiene que checkear
	not(IndiceF is FilasTotales),
	not(IndiceC is ColumnasTotales),
	nth0(IndiceF, PistasFilas, ListaFila),
	nth0(IndiceF, Grilla, GrillaFila),
	checkear(ListaFila, GrillaFila, F),
	IndiceFNuevo is IndiceF + 1,

	nth0(IndiceC, PistasColumnas, ListaColumna),
	obtenerColumna(Grilla, IndiceC, GrillaCol),
	checkear(ListaColumna, GrillaCol, C),
	IndiceCNuevo is IndiceC + 1,

	checkearTodosAux(Grilla, FilaSatL, PistasFilas, IndiceFNuevo, FilasTotales, ColSatL, PistasColumnas, IndiceCNuevo, ColumnasTotales).

checkearTodosAux(Grilla, FilaSatL, PistasFilas, IndiceF, FilasTotales, [C | ColSatL], PistasColumnas, IndiceC, ColumnasTotales):-
	% El mismo caso recursivo, pero no tiene filas que checkear (la grilla es mas alta que ancha)
	not(IndiceC is ColumnasTotales),
	IndiceF is FilasTotales,
	nth0(IndiceC, PistasColumnas, ListaColumna),
	obtenerColumna(Grilla, IndiceC, GrillaCol),
	checkear(ListaColumna, GrillaCol, C),
	IndiceCNuevo is IndiceC + 1,

	checkearTodosAux(Grilla, FilaSatL, PistasFilas, IndiceF, FilasTotales, ColSatL, PistasColumnas, IndiceCNuevo, ColumnasTotales).

checkearTodosAux(Grilla, [F | FilaSatL], PistasFilas, IndiceF, FilasTotales, ColSatL, PistasColumnas, IndiceC, ColumnasTotales):-
	% El mismo caso recursivo, pero no tiene columnas que checkear (la grilla es mas ancha que alta)
	not(IndiceF is FilasTotales),
	IndiceC is ColumnasTotales,
	nth0(IndiceF, PistasFilas, ListaFila),
	nth0(IndiceF, Grilla, GrillaFila),
	checkear(ListaFila, GrillaFila, F),
	IndiceFNuevo is IndiceF + 1,

	checkearTodosAux(Grilla, FilaSatL, PistasFilas, IndiceFNuevo, FilasTotales, ColSatL, PistasColumnas, IndiceC, ColumnasTotales).
