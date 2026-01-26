import { Board } from "./board.mjs";
import { Pawn, King, Knight, kingsMap } from "./pieces.mjs";


const listOfMoves = [];

class BoardInteractions {
    static rearrangeBoardPieces(board, piece, row, column) {
        let typeOfMove = this.legalMove(board, piece, row, column);
        if (!typeOfMove) return false;
        
        let capturedPiece;
        if (typeOfMove === "move" || typeOfMove === "capture") {
            capturedPiece = board[row][column].piece;

            delete board[piece.position[0]][piece.position[1]].piece;
            board[row][column].piece = piece;

            piece.lastPosition = [...piece.position];
            piece.position = [row, column];
        } else

        if (typeOfMove === "captureEnPassant") {
            capturedPiece = listOfMoves[listOfMoves.length - 1].piece;

            delete board[piece.position[0]][piece.position[1]].piece;
            board[row][column].piece = piece;
            
            delete board[capturedPiece.position[0]][capturedPiece.position[1]].piece;

            piece.lastPosition = [...piece.position];
            piece.position = [row, column];
        }

        this.updateConsole(typeOfMove, piece, capturedPiece, row, column, board);
        return true;
    }
    static legalMove(board, piece, row, column) {     
        let move = this.move(board, piece, row, column);
        let capture = this.capture(board, piece, row, column);
        let typeOfMove = move ? move : capture;

        if (!typeOfMove) return false;

        if (this.checkObstacules(board, piece, row, column)) return false;

        let myKing = kingsMap.get(piece.color);
        if (this.selfCheckKing(board, myKing, piece, row, column)) return false;

        return typeOfMove;
    }


    static move(board, piece, row, column) {
        if (!piece.move(row, column)) return false;
        if (board[row][column].piece) return false;
        
        return "move";
    }
    static castle(board, king, row, column) {
        if (king.position[0] !== king.initialPosition[0]
            || king.position[1] !== king.initialPosition[1]) return false;

        //is Rook initial position === position
        //use function min maxi function to determine lowest number to deteremine wich rook
        if (rook.position[0] !== rook.initialPosition[0]
            || rook.position[1] !== rook.initialPosition[1]) return false;

        if (legalMove(board, desiredRow, desiredColumn)) return false;
    }

    static capture(board, piece, row, column) {
        if (!piece.capture(row, column)) return false;
        if (piece instanceof Pawn) {
            let typeOfMove = this.captureEnPassant(board, piece, row, column);
            if (typeOfMove) return typeOfMove;
        }

        let capturedPiece = board[row][column].piece;
        if (!capturedPiece || 
            capturedPiece.color === piece.color) return false;

        return "capture";
    }
    static captureEnPassant(board, pawn, row, column) {
        if (!this.enPassant(pawn, column)) return false;

        let myKing = kingsMap.get(pawn.color);
        if (this.selfCheckKingByEnPassant(board, myKing, pawn, row, column)) return false;

        return "captureEnPassant";
    }
    static enPassant(pawn, column) {
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
        if ( !(Math.abs(enemyPawnColumn - pawnColumn) === 1 
                && enemyPawnRow === pawnRow
                && column === enemyPawnColumn) ) return false; 

        return true;
    }


    static checkObstacules(board, piece, row, column) {
        if (piece instanceof Knight || piece instanceof King) return false;

        let j = piece.position[1];
        let i = piece.position[0];
        let rowChange = piece.getDisplacement(piece, row, column)[0];
        let columnChange = piece.getDisplacement(piece, row, column)[1];

        while ( !(i === row && j === column) ) {
            if (rowChange < 0) {i--} else if (rowChange > 0) {i++} 
            else if (rowChange === 0) {i === row}

            if (columnChange < 0) {j--} else if (columnChange > 0) {j++} 
            else if (columnChange === 0) {j === column}

            if (i === row && j === column) continue;

            if (board[i][j].piece) return true;
        }

        return false;
    }

    static selfCheckKing(board, ownKing, ownPiece, desiredRow, desiredColumn) {
        let originalPosition = ownPiece.position;
        let enemyPieceFromDesiredPosition = board[desiredRow][desiredColumn].piece;

        board[desiredRow][desiredColumn].piece = ownPiece;
        delete board[ownPiece.position[0]][ownPiece.position[1]].piece;

        let kingRow, kingColumn;
        if (ownKing === ownPiece) {
            kingRow = desiredRow;
            kingColumn = desiredColumn;
        } else {
            kingRow = ownKing.position[0];
            kingColumn = ownKing.position[1];
        }

        let kingCanBeCaptured = true;
        kingCanBeCaptured = this.canBeCaptured(board, ownKing, kingRow, kingColumn);

        if (enemyPieceFromDesiredPosition) {
            board[desiredRow][desiredColumn].piece = enemyPieceFromDesiredPosition;
        } else {
            delete board[desiredRow][desiredColumn].piece;
        }
        board[originalPosition[0]][originalPosition[1]].piece = ownPiece;

        if (!kingCanBeCaptured) return false;

        let lastMove = listOfMoves[listOfMoves.length - 1]; //just for the console
        if (ownKing === ownPiece) {
            if (lastMove && lastMove.piece.color !== ownPiece.color) //just for the console
            console.log("Can't put yourself in check.");
        } 
        else {
            if (ownPiece instanceof Pawn && this.enPassant(ownPiece, desiredColumn)) {
                if (lastMove && lastMove.ownPiece.color !== piece.color) //just for the console
                console.log(`selfCheckKingByEnPassant says: \n  Can't. Your king would be captured on the next move.`);
            }
        }
        
        return true;
    }
    static selfCheckKingByEnPassant(board, ownKing, ownPawn, desiredRow, desiredColumn) {
        let originalPosition = ownPawn.position;
        let enemyPawn = listOfMoves[listOfMoves.length - 1].piece;

        board[desiredRow][desiredColumn].piece = ownPawn;
        delete board[ownPawn.position[0]][ownPawn.position[1]].piece;
        delete board[ownPawn.position[0]][ownPawn.position[1]].piece;

        Board.displayConsoleBoard();
        let kingCanBeCaptured = true;
        kingCanBeCaptured = 
            this.canBeCaptured(board, ownKing, ownKing.position[0], ownKing.position[1]);

        delete board[desiredRow][desiredColumn].piece;
        board[originalPosition[0]][originalPosition[1]].piece = ownPawn;
        board[enemyPawn.position[0]][enemyPawn.position[1]].piece = enemyPawn;

        if (!kingCanBeCaptured) return false;

        let lastMove = listOfMoves[listOfMoves.length - 1]; //just for the console
        if (lastMove && lastMove.piece.color !== ownPawn.color) //just for the console
        console.log(`selfCheckKingByEnPassant says: \n  Can't. Your king would be captured on the next move.`);

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

                if (this.checkObstacules(board, anotherPiece, row, column)) continue;
                
                if (lastMove && lastMove.piece.color !== piece.color)//just for the console
                console.log(`canBeCaptured says: \n After such move ${piece.color} ${piece.name} can be captured by ${anotherPiece.color} ${anotherPiece.name}`);
                
                return true;
            }
        }
        
        if (lastMove && lastMove.piece.color !== piece.color)//just for the console
        console.log(`canBeCaptured says: \n  ${piece.color} ${piece.name}  can not be captured.`);

        return false;
    }


    static checkForCheckMate(board, piece) {
        let enemyColor = piece.color === "white" ? "black" : "white";
        let enemyKing = kingsMap.get(enemyColor);
        if ( this.canBeCaptured(board, enemyKing, enemyKing.position[0], enemyKing.position[1]) 
            && !this.canSaveKing(board, enemyColor) ) console.log("CHECK MATE");
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
                for (let i = 0; i <= 7; i++) {
                    for (let j = 0; j <= 7; j++) {

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
                consoleMessage = `Update says: \n  ${piece.color} ${piece.name}  was moved to [${row},${column}]`;
                break;
            }
            case "capture": {
                consoleMessage = `Update says: \n  ${piece.color} ${piece.name}  captured ${capturedPiece.color} ${capturedPiece.name}  at [${row},${column}]`;
                break;
            }
            case "captureEnPassant": {
                consoleMessage = `Update says: \n  ${piece.color} ${piece.name}  captured en-passant ${capturedPiece.color} ${capturedPiece.name}  and landed at [${row},${column}]`;
                break;
            }
        }

        console.log("legalMove happened");
        console.log(consoleMessage);
        this.checkForCheckMate(board, piece);
        Board.displayConsoleBoard();
    }
}


export { BoardInteractions, listOfMoves }