import { Board } from "./board.mjs";
import { Pawn, King } from "./pieces.mjs";


const listOfMoves = [];

class BoardRules {
    static move(piece, row, column) {
        if (Board.board[row][column].piece) return false;

        delete Board.board[piece.position[0]][piece.position[1]].piece;
        Board.board[row][column].piece = piece;

        return true;
    }

    static capture(piece, row, column) {
        if (!Board.board[row][column].piece) return false;
        if (Board.board[row][column].piece instanceof King) return false;
        if (Board.board[row][column].piece.color === piece.color) return false;

        delete Board.board[piece.position[0]][piece.position[1]].piece;
        Board.board[row][column].piece = piece;

        return true;
    }

    static enPassant(piece, column) {
        if (listOfMoves.length === 0) return false;

        let lastMovedPiece = listOfMoves[listOfMoves.length - 1].piece;
        let lastRowChange = 
            Math.abs(lastMovedPiece.position[0] - lastMovedPiece.lastPosition[0]);
        if ( !(lastMovedPiece instanceof Pawn && lastRowChange === 2) ) return false;

        let lastPieceRow = lastMovedPiece.position[0];
        let lastPieceColumn = lastMovedPiece.position[1];
        let activePieceRow = piece.position[0];
        let activePieceColumn = piece.position[1];
        if ( !(Math.abs(lastPieceColumn - activePieceColumn) === 1 
                && lastPieceRow === activePieceRow
                && column === lastPieceColumn) ) return false;

        return true;
    }

    static captureEnPassant(piece, row, column) {
            delete Board.board[piece.position[0]][piece.position[1]].piece;
            Board.board[row][column].piece = piece;
            
            let lastMove = listOfMoves[listOfMoves.length -1];
            delete Board.board[lastMove.row][lastMove.column].piece;
            return true;
    }

    static kingsLegalDistance(piece, row, column) {
        if (row === piece.position[0] && column === piece.position[1]) return;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                if (row + i < 0 || row + i >= 8 || column + j < 0 || column + j >= 8) continue;
                let newNeighbourPiece = Board.board[row + i][column + j].piece;
                if (newNeighbourPiece instanceof King && newNeighbourPiece !== piece)
                    return false;
            }
        }
        return true;
    }

    static checkObstacules(piece, row, column, rowChange, columnChange) {
        let j = piece.position[1];
        let i = piece.position[0];

        while ( !(i === row && j === column) ) {
            if (rowChange < 0) {i--} else if (rowChange > 0) {i++} 
            else if (rowChange === 0) {i === row}

            if (columnChange < 0) {j--} else if (columnChange > 0) {j++} 
            else if (columnChange === 0) {j === column}

            if (i === row && j === column) continue;

            if (Board.board[i][j].piece) return true;
        }

        return false;
    }
}

//Definir turnos truncar move con piezas obstaculo en la trayectoria
//y definir checks

export { BoardRules, listOfMoves }