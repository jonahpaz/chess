import { Knight, Pawn, piecesMap } from "./pieces.mjs";

const listOfMoves = [];
class Move {
    constructor(previousBoard, typeOfMove, movedPiecesArr, capturedPiece, statusObj) {
        // this.name = movedPiecesArr ? this.getName(typeOfMove, movedPiecesArr, statusObj) : "start"; //luego que defina bien el metodo

        movedPiecesArr = movedPiecesArr ? movedPiecesArr : [];
        this.activePlayer = movedPiecesArr[0].color;
        this.previousBoardSkeleton = 
            previousBoard ? this.getBoardSkeleton(previousBoard) : undefined;
        this.previousCementerySkeleton = undefined;

        this.typeOfMove = typeOfMove;
        this.movedPieces = movedPiecesArr;
        this.capturedPiece = capturedPiece;

        statusObj = statusObj ? statusObj : {check: false, kingSaviors: [], checkMate: false};
        this.check = statusObj.check;
        this.kingSaviors = [];
        this.kingSaviors.push(...statusObj.kingSaviors);
        this.checkMate = statusObj.checkMate;

        listOfMoves.push(this);
    }

    getName(typeOfMove, movedPiecesArr, statusObj) {
        let movedPiece = movedPiecesArr[0];

        let letterPiece = "";
        if ( !(movedPiece instanceof Pawn) ) {
            if (movedPiece instanceof Knight) {
                letterPiece = "N";
            } else {
                letterPiece = movedPiece.name[0].toUpperCase();
            }
        }
        let files = "abcdefgh";
        let file = files[movedPiece.file];
        let rank = movedPiece.rank;

        let moveSymbol = "";
        if (typeOfMove === "castle") {
            return "0-0" // Gotta define long and short castle later long would be "0-0-0"
        } else if (typeOfMove === "capture") {
            moveSymbol = "x";
        } else if (typeOfMove === "enPassant") {

        } 
        let ending = "";
        if (statusObj.check && !statusObj.checkMate) {
            ending = "+";
        } else if (statusObj.checkMate) {
            ending = "#";
        } else if (typeOfMove === "promotion") {
            //gotta define promotion first in board-interactions and then how to retrieve it
            //let promotion or something y luego initial touppercase y asi
            ending = `=`;
        } 
        
        return `${letterPiece}${typeOfMove}${file}${rank}${ending}`
    }
    getBoardSkeleton(board) {
        let boardSkeleton = [];

        for (const [i, rank] of board.entries()) {
            boardSkeleton.push([]);

            for (const square of rank) {
                let piece = square.piece;
                if (!piece) {boardSkeleton[i].push(undefined); continue;}

                boardSkeleton[i].push(piece.id);
            }
        }
        return boardSkeleton;
    }
    setPreviousBoard(board) {
        for (const [i, rankSkeleton] of this.previousBoardSkeleton.entries()) {
            for (const [j, pieceId] of rankSkeleton.entries()) {
                if (!pieceId) continue;

                let piece = piecesMap.get(pieceId).piece;
                let positions = piecesMap.get(pieceId).positions;
                
                piece.position = positions[positions.length - 2] ?
                    positions[positions.length - 2] : piece.initialPosition;
                piece.lastPosition = positions[positions.length - 3] ?
                    positions[positions.length - 3] : piece.initialPosition;
                board[i][j].square.piece = piece;
            }
        }
        return board;
    }  
}


export { Move, listOfMoves }