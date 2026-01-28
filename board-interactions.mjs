import { Board } from "./board.mjs";
import { Pawn, Knight, kingsMap, rooksMap } from "./pieces.mjs";


const listOfMoves = [];

const log = document.querySelector(".log");/////////////

class BoardInteractions {
    static #typOfmove = `ilegalMove`; //for future Display messages

    static boardUpdate(board, piece, row, column) {
        let typeOfMove = this.legalMove(board, piece, row, column);
        if (!typeOfMove) return false;
        
        let capturedPiece;
        if (typeOfMove === "move" || typeOfMove === "capture") {
            capturedPiece = board[row][column].piece;
            delete board[piece.position[0]][piece.position[1]].piece;
            board[row][column].piece = piece;
        } else

        if (typeOfMove === "castle") {
            let rookInitialColumn, rookCastleColumn;
            if (column - piece.position[1] > 0) {
                rookInitialColumn = 7; rookCastleColumn = 5;
            } else {
                rookInitialColumn = 0; ; rookCastleColumn = 3;
            }
            let rook = rooksMap.get(`${rookInitialColumn}-${piece.color}`);

            delete board[piece.position[0]][piece.position[1]].piece;
            delete board[rook.position[0]][rook.position[1]].piece;
            board[row][column].piece = piece;
            board[row][rookCastleColumn].piece = rook;

            rook.lastPosition = [...rook.position];
            rook.position = [row, rookCastleColumn];
        }

        if (typeOfMove === "enPassant") {
            capturedPiece = listOfMoves[listOfMoves.length - 1].piece;

            delete board[piece.position[0]][piece.position[1]].piece;
            board[row][column].piece = piece;
            delete board[capturedPiece.position[0]][capturedPiece.position[1]].piece;
        }

        piece.lastPosition = [...piece.position];
        piece.position = [row, column];

        this.updateConsole(typeOfMove, piece, capturedPiece, row, column, board);
        return true;
    }
    static legalMove(board, piece, row, column) {     
        let move = this.move(board, piece, row, column);
        let capture = this.capture(board, piece, row, column);
        let typeOfMove = move ? move : capture;

        if (!typeOfMove) return false;
        if (typeOfMove === "enPassant" || typeOfMove === "castle") return typeOfMove;

        if (this.thereAreObstacules(board, piece, row, column)) return false;

        let myKing = kingsMap.get(piece.color);
        if (this.selfCheckKing(board, myKing, piece, row, column)) return false;

        return typeOfMove;
    }


    static move(board, piece, row, column) {
        let move = piece.move(row, column);
        if (move === "castle") {
            let castle = this.castle(board, piece, row, column);
            if (castle) {return castle} else {return false}
        }
        if (!move) return false;
        if (board[row][column].piece) return false;
        return move;
    }
    static castle(board, king, row, column) {
        if (this.canBeCaptured(board, king, king.position[0], king.position[1])) return false;

        let rook = king.getRookForCastle(column);
        if (rook.position !== rook.initialPosition) return false;
        if (board[row][rook.position[1]].piece !== rook) return false;

        delete board[rook.position[0]][rook.position[1]].piece;
        let obstaculesForKing = this.thereAreObstacules(board, king, row, column);
        board[rook.position[0]][rook.position[1]].piece = rook;
        if (obstaculesForKing) return false;

        delete board[king.position[0]][king.position[1]].piece;
        let obstaculesForRook = this.thereAreObstacules(board, rook, row, rook.castleColumn);
        board[king.position[0]][king.position[1]].piece = king;
        if (obstaculesForRook) return false;
        
        let passingColumns = king.getPassingColumns(column);
        passingColumns.forEach(
            passingColumn => {
                if (this.selfCheckKing(board, king, king, row, passingColumn)) return false;
            }
        );
        if (this.selfCheckKingByCastling(board, king, rook, row, column, rook.castleColumn)) return false;
        
        return "castle";
    }

    static capture(board, piece, row, column) {
        let capture = piece.capture(row, column);
        if(!capture) return false;
        if (piece instanceof Pawn) {
            let enPassant = this.enPassant(board, piece, row, column);
            if (enPassant) return enPassant;
        }

        let capturedPiece = board[row][column].piece;
        if (!capturedPiece || capturedPiece.color === piece.color) return false;

        return capture;
    }
    static enPassant(board, pawn, row, column) {
        if (listOfMoves.length === 0) return false;

        let lastMovedPiece = listOfMoves[listOfMoves.length - 1].piece;
        if ( !(lastMovedPiece instanceof Pawn) ) return false;
        let enemyPawn = lastMovedPiece;

        let enemyRowChange = 
            Math.abs(enemyPawn.position[0] - enemyPawn.lastPosition[0]);
        if (enemyRowChange !== 2) return false;

        let enemyPawnRow = enemyPawn.position[0];
        let enemyPawnColumn = enemyPawn.position[1];
        let pawnRow = pawn.position[0];
        let pawnColumn = pawn.position[1];
        if ( Math.abs(enemyPawnColumn - pawnColumn) !== 1 
            || pawnRow !== enemyPawnRow
            || column !== enemyPawnColumn ) return false; 

        let myKing = kingsMap.get(pawn.color);
        if (this.selfCheckKingByEnPassant(board, myKing, pawn, row, column)) return false;

        return "enPassant";
    }


    static selfCheckKing(board, ownKing, ownPiece, targetRow, targetColumn) {
        let pieceInTargetPosition = board[targetRow][targetColumn].piece;

        board[targetRow][targetColumn].piece = ownPiece;
        delete board[ownPiece.position[0]][ownPiece.position[1]].piece;

        let kingRow, kingColumn;
        if (ownKing === ownPiece) {
            kingRow = targetRow;
            kingColumn = targetColumn;
        } else {
            kingRow = ownKing.position[0];
            kingColumn = ownKing.position[1];
        }

        let kingCanBeCaptured;
        kingCanBeCaptured = this.canBeCaptured(board, ownKing, kingRow, kingColumn);




        if (pieceInTargetPosition) 
             {board[targetRow][targetColumn].piece = pieceInTargetPosition}
        else {delete board[targetRow][targetColumn].piece}

        board[ownPiece.position[0]][ownPiece.position[1]].piece = ownPiece;
        
        if (!kingCanBeCaptured) return false;
        return true;
    }
    static selfCheckKingByCastling(board, ownKing, ownRook, row, kingCastleColumn, rookCastleColumn) { //Only actually makes a difference if I develop Fisher-Random-Chess later on.
        board[row][kingCastleColumn].piece = ownKing;
        board[row][rookCastleColumn].piece = ownRook;
        delete board[ownKing.position[0]][ownKing.position[1]].piece;
        delete board[ownRook.position[0]][ownRook.position[1]].piece;

        let kingCanBeCaptured;
        kingCanBeCaptured = this.canBeCaptured(board, ownKing, row, kingCastleColumn);
        
        delete board[row][kingCastleColumn].piece;
        delete board[row][rookCastleColumn].piece;
        board[ownKing.position[0]][ownKing.position[1]].piece = ownKing;
        board[ownRook.position[0]][ownRook.position[1]].piece = ownRook;

        if (!kingCanBeCaptured) return false;
        return true;
    }
    static selfCheckKingByEnPassant(board, ownKing, ownPawn, targetRow, targetColumn) {
        let enemyPawn = listOfMoves[listOfMoves.length - 1].piece;

        board[targetRow][targetColumn].piece = ownPawn;
        delete board[ownPawn.position[0]][ownPawn.position[1]].piece;
        delete board[ownPawn.position[0]][ownPawn.position[1]].piece;

        let kingCanBeCaptured = true;
        kingCanBeCaptured = 
            this.canBeCaptured(board, ownKing, ownKing.position[0], ownKing.position[1]);

        delete board[targetRow][targetColumn].piece;
        board[ownPawn.position[0]][ownPawn.position[1]].piece = ownPawn;
        board[enemyPawn.position[0]][enemyPawn.position[1]].piece = enemyPawn;

        if (!kingCanBeCaptured) return false;
        return true;
    }


    static canBeCaptured(board, piece, row, column) {
        let lastMove = listOfMoves[listOfMoves.length - 1];//just for the console
        for (const rowArr of board) {
            for (const square of rowArr) {
                let anotherPiece = square.piece;
                if (!anotherPiece) continue;
                if (anotherPiece.color === piece.color) continue;

                let anotherRowChange = row - anotherPiece.position[0];
                let anotherColumnChange = column - anotherPiece.position[1];

                if (!anotherPiece.legalCaptureDisplacement(anotherRowChange, anotherColumnChange)) continue;
                if (this.thereAreObstacules(board, anotherPiece, row, column)) continue;
                
                // if (lastMove && lastMove.piece.color !== piece.color)//just for the console
                // console.log(`canBeCaptured says: \n After such move ${piece.color} ${piece.name} can be captured by ${anotherPiece.color} ${anotherPiece.name}`);
                
                return true;
            }
        }
        
        // if (lastMove && lastMove.piece.color === piece.color)//just for the console
        // console.log(`canBeCaptured says: \n  ${piece.color} ${piece.name}  can not be captured.`);

        return false;
    }

    static thereAreObstacules(board, piece, finalRow, finalColumn) {
        if (piece instanceof Knight) return false;

        let rowChange      = finalRow - piece.position[0];
        let columnChange   = finalColumn - piece.position[1];
        let startingRow    = {value: piece.position[0]};
        let startingColumn = {value: piece.position[1]};

        function plusplus(startingCoordenate) {
            return () => {return ++startingCoordenate.value}
        }
        function minusminus(startingCoordenate) {
            return () => {return --startingCoordenate.value}
        }

        let rowCounter, columnCounter;
        if      (rowChange > 0)   {rowCounter = plusplus(startingRow)} 
        else if (rowChange < 0)   {rowCounter = minusminus(startingRow)} 
        else if (rowChange === 0) {rowCounter = () => finalRow}

        if      (columnChange > 0)   {columnCounter = plusplus(startingColumn)}
        else if (columnChange < 0)   {columnCounter = minusminus(startingColumn)}
        else if (columnChange === 0) {columnCounter = () => finalColumn}

        let passingRow = startingRow;  let passingColumn = startingColumn;
        rowCounter(); columnCounter();

        while ( !(startingRow.value === finalRow && startingColumn.value === finalColumn) ) {
            if (board[passingRow.value][passingColumn.value].piece) return true;
            rowCounter(); columnCounter();
        }
        return false;
    }

    static checkForCheckMate(board, piece) {
        let enemyColor = piece.color === "white" ? "black" : "white";
        let enemyKing = kingsMap.get(enemyColor);
        if ( this.canBeCaptured(board, enemyKing, enemyKing.position[0], enemyKing.position[1]) 
            && !this.canSaveKing(board, enemyColor) ) {console.log("CHECK MATE");
        log.textContent += `\nCHECK MATE`;}////////////////////////////////////
    }
    static canSaveKing(board, color) {
        let thereIsAtleastOneSavior = false;

        for (const rowArr of board) {
            for (const square of rowArr) {
                if (!square.piece || 
                    square.piece.color !== color) {
                        continue;
                }

                let kingSavior = square.piece;
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {

                        if (this.legalMove(board, kingSavior, i, j)) {
                            thereIsAtleastOneSavior = true;
                            console.log(`canSaveKing says: \n  ${kingSavior.color} ${kingSavior.name} ${kingSavior.position.toString()} can save the King by moving to [${i}, ${j}]`);
                        }
                    }
                }
            }
        }
        if (!thereIsAtleastOneSavior) console.log(`canSaveKing says: \n  Can't save King :(`);
        return thereIsAtleastOneSavior;
    }

    static updateConsole(typeOfMove, piece, capturedPiece, row, column, board) {
        let consoleMessage;
        switch (typeOfMove) {
            case "move": {
                consoleMessage = `consoleUpdate says: \n  ${piece.color} ${piece.name}  was moved to [${row},${column}]`;
                break;
            }
            case "capture": {
                consoleMessage = `consoleUpdate says: \n  ${piece.color} ${piece.name}  captured ${capturedPiece.color} ${capturedPiece.name}  at [${row},${column}]`;
                break;
            }
            case "castle": {
                consoleMessage = `consoleUpdate says: \n  ${piece.color} ${piece.name} castled to [${row},${column}]`;
                break;
            }
            case "enPassant": {
                consoleMessage = `consoleUpdate says: \n  ${piece.color} ${piece.name}  captured en-passant ${capturedPiece.color} ${capturedPiece.name}  and landed at [${row},${column}]`;
                break;
            }
        }

        console.log("legalMove happened");
        console.log(consoleMessage);
        log.textContent = consoleMessage;///////////
        this.checkForCheckMate(board, piece);
        Board.displayConsoleBoard();
    }

    static getPossibleLegalMoves(board, piece) {
        const possibleLegalMoves = [];

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {

                if (this.legalMove(board, piece, i, j)) {
                    let possibleMove = [i, j];
                    possibleLegalMoves.push(possibleMove);
                }
            }
        }
        return possibleLegalMoves;
    }
}


export { BoardInteractions, listOfMoves }