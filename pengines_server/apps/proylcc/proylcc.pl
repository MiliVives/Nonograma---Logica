:- module(proylcc,
	[  
		put/8
	]).

:-use_module(library(lists)).
:-use_module(library(clpfd)).
:-use_module(proylcc:init).

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


put(Content, [RowN, ColN], PistasFilas, PistasColumnas, Grilla, GrillaRes, RowSat, ColSat):-
	%reemplaza la fila número RowN de la matriz Grilla con una nueva fila NewRow, y el resultado se almacena en GrillaRes.
	replace(Row, RowN, NewRow, Grilla, GrillaRes),
	
	% verifica si la celda especificada ([RowN, ColN]) está vacía o contiene un Content. Si está vacía, la reemplaza con el Content.
	(replace(Celda, ColN, _, Row, NewRow), Celda == Content ; replace(_Celda, ColN, Content, Row, NewRow)),

	%checquea si la pos [RowN, ColN] cumple alguna pista.
	checkSat([RowN, ColN], PistasFilas, PistasColumnas,GrillaRes, RowSat, ColSat).	

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


checkSat([RowN, ColN], PistasFilas, PistasColumnas,GrillaRes, RowSat, ColSat):-
	nth0(RowN, PistasFilas, ListaFila),nth0(RowN, GrillaRes, GrillaFila),
	checkear(ListaFila, GrillaFila, RowSat),

	nth0(ColN, PistasColumnas, ListaColumna),
	getCol(GrillaRes, ColN, GrillaCol),
	checkear(ListaColumna, GrillaCol, ColSat).



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% getCol(Grilla, IndiceColumna, ColumnaResultado).
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
% convertir/3
%
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
    not(var(X);X="X"),% verifica si X no es una variable y no es igual a "X" (si no es X es marcado)
	LeidosAux is Leidos + 1,
	convertir(Xs, Ys, LeidosAux).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% checkAll/5
% Checkea todas las filas y columnas de la grilla, siendo FilaSatL la lista de resultados de checkear las filas, y ColSatL de checkear las columnas

checkAll(Grilla, PistasFilas, FilaSatL, PistasColumnas, ColSatL) :-
    length(Grilla, FilasTotales),
    length(PistasColumnas, ColumnasTotales),
    checkRows(Grilla, PistasFilas, FilaSatL, 0, FilasTotales),
    checkColumns(Grilla, PistasColumnas, ColSatL, 0, ColumnasTotales).

% checkRows/5
% Chequea todas las filas de las grillas.
checkRows(_, _, [], FilasTotales, FilasTotales).
checkRows(Grilla, [PistasFila|RestoFilas], [SatFila|FilaSatL], IndiceF, FilasTotales) :-
    nth0(IndiceF, Grilla, Fila),
    checkear(PistasFila, Fila, SatFila),
    IndiceFNuevo is IndiceF + 1,
    checkRows(Grilla, RestoFilas, FilaSatL, IndiceFNuevo, FilasTotales).

% checkColumns/5
% Chequea todas las columnas de las grillas.
checkColumns(_, _, [], ColumnasTotales, ColumnasTotales).
checkColumns(Grilla, [PistasColumna|RestoColumnas], [SatColumna|ColSatL], IndiceC, ColumnasTotales) :-
    getCol(Grilla, IndiceC, Columna),
    checkear(PistasColumna, Columna, SatColumna),
    IndiceCNuevo is IndiceC + 1,
    checkColumns(Grilla, RestoColumnas, ColSatL, IndiceCNuevo, ColumnasTotales).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%     SOLUCIONADOR     %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


%llena las filas y columnas de la cuadrícula en función de las restricciones y el estado inicial.
%Utiliza técnicas de satisfacción de restricciones para asignar valores (1s para celdas llenas y 0s para celdas vacías)
solver(RowSpec, ColSpec, InitialGrid, Grid) :-
    % utiliza el estado inicial de cada fila en InitialGrid para restringir las celdas que pueden estar llenas 
    % o vacías en la solución final. Por ejemplo, si una celda en InitialGrid está marcada como "#" (llena), 
    % la celda correspondiente en la cuadrícula de salida Grid debe estar configurada como 1 (llena).
    rows(RowSpec, InitialGrid, Grid),
    transpose(Grid, GridT),
    transpose(InitialGrid, InitialGridT),
    rows(ColSpec, InitialGridT, GridT).

% Parte de la resolución de la grilla usando autómatas
% Recorre cada fila de grilla
rows([], [], []).
rows([C|Cs], [IR|IRs], [R|Rs]) :-
    row(C, IR, R),
    rows(Cs, IRs, Rs).

% A partir de una fila dada, verifica que la cantidad de celdas pintadas coincida con las restricciones.
% Utiliza el autómata para generar las configuraciones de la fila.
% Aplica el estado inicial a la fila utilizando el apply_initial.
row(Ks, InitialRow, Row) :-
    sum(Ks,  #=, Ones),
    sum(Row, #=, Ones),
    arcs(Ks, Arcs, start, Final),
    append(Row, [0], RowZ),
    automaton(RowZ, [source(start), sink(Final)], [arc(start,0,start) | Arcs]),
    apply_initial(InitialRow, Row).

% Compara cada elemento de una fila de la grilla inicial y evalua si se debe aplicar alguna restricción más.
apply_initial([], []).
apply_initial([I|Is], [R|Rs]) :-
    (I == '#' -> R #= 1 ; I == 'X' -> R #= 0 ; true),
    apply_initial(Is, Rs).

% Parte de la resolución de la grilla usando autómatas
% Genera los arcos del autómata, los cuales verifican las restricciones de una fila dada.
arcs([], [], Final, Final).
arcs([K|Ks], Arcs, CurState, Final) :-
    gensym(state, NextState),
    (K == 0 ->
        Arcs = [arc(CurState,0,CurState), arc(CurState,0,NextState) | Rest],
        arcs(Ks, Rest, NextState, Final)
    ;
        Arcs = [arc(CurState,1,NextState) | Rest],
        K1 #= K-1,
        arcs([K1|Ks], Rest, NextState, Final)
    ).

% Arma la grilla que resuelve el juego
make_grid(Grid, InitialGrid, X, Y, Vars) :-
    length(Grid, X), % Inicializa Grid con X variables
    length(InitialGrid, X),% Verifica que tenga X variables
    make_rows(Grid, InitialGrid, Y, Vars).

% Arma las filas de la grilla que resuelve el juego
make_rows([], [], _, []).
make_rows([R|Rs], [IR|IRs], Len, Vars) :-
    length(R, Len),
    length(IR, Len),
    make_rows(Rs, IRs, Len, Vars0),
    append(R, Vars0, Vars).

% Predicado para contar elementos de la lista
count([], 0).
count([_|[]], N) :- N is 1.
count([_|T], N) :- count(T, M), N is M + 1.

% Consulta para resolver el nonograma desde game
go(Grid) :-
    init(Rows, Cols, InitialGrid),
    count(Rows, X),
    count(Cols, Y),
    make_grid(Grid, InitialGrid, X, Y, Vars),
    solver(Rows, Cols, InitialGrid, Grid),
    label(Vars).
