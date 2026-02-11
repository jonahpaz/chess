import { Knight, Pawn, piecesMap } from "./pieces.mjs";

const listOfMoves = [];
class Move {
    constructor(previousBoard, typeOfMove, movedPiecesArr, capturedPiece, promotion, statusObj) {
        movedPiecesArr = movedPiecesArr ? movedPiecesArr : [];
        this.activePlayer = movedPiecesArr[0].color;
        this.previousBoardSkeleton = 
            previousBoard ? this.getBoardSkeleton(previousBoard) : undefined;
        // this.previousDungeonSkeleton = this.getDungeonSkeleton(previousDungeon);
        // also need to add previousDungeon parameter
        //first gotta finish defining the dungeon logic

        this.typeOfMove = typeOfMove;
        this.movedPieces = movedPiecesArr;
        this.capturedPiece = capturedPiece;
        this.promotion = promotion;

        statusObj = statusObj ? statusObj : {check: false, kingSaviors: [], checkMate: false};
        this.check = statusObj.check;
        this.kingSaviors = [];
        this.kingSaviors.push(...statusObj.kingSaviors);
        this.checkMate = statusObj.checkMate;

        //this.name =this.getName(typeOfMove, movedPiecesArr, promotion, statusObj); 
        //Later, when I finish dungeons stuff

        listOfMoves.push(this);
    }

    getName(typeOfMove, movedPiecesArr, promotion, statusObj) {
        let name = ``;

        let statusString = ``;
        if (statusObj.checkMate) {statusString = `#`}
        else if (statusObj.check) {statusString = `+`}
        
        if (typeOfMove === "castle") {
            let king = movedPiecesArr[0];
            if (king.position[1] > king.lastPosition[1]) 
            {name = `0-0${statusString}`} else {name = `0-0-0${statusString}`}
            return name;
        }

        let movedPieceString = ``;
        let movedPiece = movedPiecesArr[0];
        if ( !(movedPiece instanceof Pawn) ) {
            if (movedPiece instanceof Knight) {
                movedPieceString = "N";
            } else {
                movedPieceString = movedPiece.name[0].toUpperCase();
            }
        }
        let captureString = ``;
        if (typeOfMove === "capture") {
            captureString = `x`;
        } else if (typeOfMove === "enPassant") {
            let pawn = movedPiecesArr[0];
            captureString = `${pawn.lastPosition[1]}x`;
        }

        let files = "abcdefgh";
        let file = files[movedPiecesArr[0].position[0]];
        let rank = movedPiecesArr[0].position[1];

        let promotionString = ``;
        if (promotion) {
            let Class = promotion.piece.constructor.name;
            promotionString = `=${Class}`;
        }
        
        name = `${movedPieceString}${captureString}${file}${rank}${promotionString}${statusString}`
        return name;
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
    getDungeonSkeleton(dungeon) {
        dungeon.white.body/////////////////////
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