import { Pawn, Knight, kingsMap, promotionOptions } from "./pieces.mjs";
import { listOfMoves } from "./moves.mjs";


class Rules {
    static legalMove(board, piece, rank, file) {     
        let move = this.move(board, piece, rank, file);
        let capture = this.capture(board, piece, rank, file);
        let typeOfMove = move ? move : capture;

        if (!typeOfMove) return false;
        if (typeOfMove === "enPassant" || typeOfMove === "castle") return typeOfMove;

        if (this.thereAreObstacules(board, piece, rank, file)) return false;

        let myKing = kingsMap.get(piece.color);
        if (this.selfCheckKing(board, myKing, piece, rank, file)) return false;

        return typeOfMove;
    }

    static move(board, piece, rank, file) {
        let move = piece.move(rank, file);
        if (move === "castle") {
            let castle = this.castle(board, piece, rank, file);
            if (castle) {return castle} else {return false}
        }
        if (!move) return false;
        if (board[rank][file].piece) return false;
        
        return move;
    }
    static castle(board, king, rank, file) {
        if (this.canBeCaptured(board, king, king.position[0], king.position[1])) return false;

        let rook = king.getRookForCastle(file);
        if (rook.position !== rook.initialPosition) return false;
        if (board[rank][rook.position[1]].piece !== rook) return false;

        delete board[rook.position[0]][rook.position[1]].piece;
        let obstaculesForKing = this.thereAreObstacules(board, king, rank, file);
        board[rook.position[0]][rook.position[1]].piece = rook;
        if (obstaculesForKing) return false;

        delete board[king.position[0]][king.position[1]].piece;
        let obstaculesForRook = this.thereAreObstacules(board, rook, rank, rook.castleFile);
        board[king.position[0]][king.position[1]].piece = king;
        if (obstaculesForRook) return false;
        
        let passingFiles = king.getPassingFiles(file);
        passingFiles.forEach(
            passingFile => {
                if (this.selfCheckKing(board, king, king, rank, passingFile)) return false;
            }
        );
        if (this.selfCheckKingByCastling(board, king, rook, rank, file, rook.castleFile)) return false;
        
        return "castle";
    }

    static capture(board, piece, rank, file) {
        let capture = piece.capture(rank, file);
        if(!capture) return false;
        if (piece instanceof Pawn) {
            let enPassant = this.enPassant(board, piece, rank, file);
            if (enPassant) return enPassant;
        }

        let capturedPiece = board[rank][file].piece;
        if (!capturedPiece || capturedPiece.color === piece.color) return false;

        return capture;
    }
    static enPassant(board, pawn, rank, file) {
        if (listOfMoves.length === 0) return false;

        let lastMovedPiece = listOfMoves[listOfMoves.length - 1].movedPieces[0];
        
        if ( !(lastMovedPiece instanceof Pawn) ) return false;
        let enemyPawn = lastMovedPiece;

        let enemyRankChange = Math.abs(enemyPawn.position[0] - enemyPawn.lastPosition[0]);
        if (enemyRankChange !== 2) return false;

        let enemyPawnRank = enemyPawn.position[0];
        let enemyPawnFile = enemyPawn.position[1];
        let pawnRank = pawn.position[0];
        let pawnFile = pawn.position[1];
        if ( Math.abs(enemyPawnFile - pawnFile) !== 1 
            || pawnRank !== enemyPawnRank
            || file !== enemyPawnFile ) return false; 

        let myKing = kingsMap.get(pawn.color);
        if (this.selfCheckKingByEnPassant(board, myKing, pawn, rank, file)) return false;

        return "enPassant";
    }

    static promote(board, pawn, rank, file) {
        if ( !(pawn instanceof Pawn) ) return false;
        if (pawn.color === "white" && rank !== 0) return false;
        if (pawn.color === "black" && rank !== 7) return false;

        let PieceString;
        while(!promotionOptions[PieceString]) {
            PieceString = prompt("Type of Piece (first letter uppercase)", "Queen");
        }
        let Piece = promotionOptions[PieceString];
        let promotion = new Piece(pawn.color, rank, file);
        return promotion;
    }


    static selfCheckKing(board, ownKing, ownPiece, targetRank, targetFile) {
        let pieceInTargetPosition = board[targetRank][targetFile].piece;

        board[targetRank][targetFile].piece = ownPiece;
        delete board[ownPiece.position[0]][ownPiece.position[1]].piece;

        let kingRank, kingFile;
        if (ownKing === ownPiece) {
            kingRank = targetRank;           kingFile = targetFile;
        } else {
            kingRank = ownKing.position[0]; kingFile = ownKing.position[1];
        }
        let kingCanBeCaptured = this.canBeCaptured(board, ownKing, kingRank, kingFile);

        if (pieceInTargetPosition) 
             {board[targetRank][targetFile].piece = pieceInTargetPosition}
        else {delete board[targetRank][targetFile].piece}
        board[ownPiece.position[0]][ownPiece.position[1]].piece = ownPiece;
        
        if (!kingCanBeCaptured) return false;
        return true;
    }
    static selfCheckKingByCastling(board, ownKing, ownRook, rank, kingCastleFile, rookCastleFile) { //Only actually makes a difference if I develop Fisher-Random-Chess later on.
        board[rank][kingCastleFile].piece = ownKing;
        board[rank][rookCastleFile].piece = ownRook;
        delete board[ownKing.position[0]][ownKing.position[1]].piece;
        delete board[ownRook.position[0]][ownRook.position[1]].piece;

        let kingCanBeCaptured;
        kingCanBeCaptured = this.canBeCaptured(board, ownKing, rank, kingCastleFile);
        
        delete board[rank][kingCastleFile].piece;
        delete board[rank][rookCastleFile].piece;
        board[ownKing.position[0]][ownKing.position[1]].piece = ownKing;
        board[ownRook.position[0]][ownRook.position[1]].piece = ownRook;

        if (!kingCanBeCaptured) return false;
        return true;
    }
    static selfCheckKingByEnPassant(board, ownKing, ownPawn, targetRank, targetFile) {
        let enemyPawn = listOfMoves[listOfMoves.length - 1].movedPieces[0];

        board[targetRank][targetFile].piece = ownPawn;
        delete board[ownPawn.position[0]][ownPawn.position[1]].piece;
        delete board[ownPawn.position[0]][ownPawn.position[1]].piece;

        let kingCanBeCaptured = true;
        kingCanBeCaptured = 
            this.canBeCaptured(board, ownKing, ownKing.position[0], ownKing.position[1]);

        delete board[targetRank][targetFile].piece;
        board[ownPawn.position[0]][ownPawn.position[1]].piece = ownPawn;
        board[enemyPawn.position[0]][enemyPawn.position[1]].piece = enemyPawn;

        if (!kingCanBeCaptured) return false;
        return true;
    }


    static canBeCaptured(board, piece, rank, file) {
        let canBeCaptured = false;

        for (const rankArr of board) {
            for (const square of rankArr) {
                let anotherPiece = square.piece;
                if (!anotherPiece) continue;
                if (anotherPiece.color === piece.color) continue;

                let anotherRankChange = rank - anotherPiece.position[0];
                let anotherFileChange = file - anotherPiece.position[1];

                if (!anotherPiece.legalCaptureDisplacement(anotherRankChange, anotherFileChange)) continue;
                if (this.thereAreObstacules(board, anotherPiece, rank, file)) continue;
                
                canBeCaptured = `After such move ${piece.color} ${piece.name} can be captured by ${anotherPiece.color} ${anotherPiece.name}`;
                return canBeCaptured;
            }
        }
        return canBeCaptured;
    }
    static thereAreObstacules(board, piece, finalRank, finalFile) {
        if (piece instanceof Knight) return false;

        let rankChange   = finalRank - piece.position[0];
        let fileChange   = finalFile - piece.position[1];
        let startingRank = {value: piece.position[0]};
        let startingFile = {value: piece.position[1]};

        function plusplus(startingCoordenate) {
            return () => {return ++startingCoordenate.value}
        }
        function minusminus(startingCoordenate) {
            return () => {return --startingCoordenate.value}
        }

        let rankCounter, fileCounter;
        if      (rankChange > 0)   {rankCounter = plusplus(startingRank)} 
        else if (rankChange < 0)   {rankCounter = minusminus(startingRank)} 
        else if (rankChange === 0) {rankCounter = () => finalRank}

        if      (fileChange > 0)   {fileCounter = plusplus(startingFile)}
        else if (fileChange < 0)   {fileCounter = minusminus(startingFile)}
        else if (fileChange === 0) {fileCounter = () => finalFile}

        rankCounter(); fileCounter();
        let passingRank = startingRank;  let passingFile = startingFile;

        while ( !(startingRank.value === finalRank && startingFile.value === finalFile) ) {
            if (board[passingRank.value][passingFile.value].piece) return true;
            rankCounter(); fileCounter();
        }
        return false;
    }

    static checkForCheckMate(board, piece) {
        let status = {check: false, kingSaviors:[], checkMate: false}

        let enemyColor = piece.color === "white" ? "black" : "white";
        let enemyKing = kingsMap.get(enemyColor);

        let canEnemyKingBeCaptured = 
            this.canBeCaptured(board, enemyKing, enemyKing.position[0], enemyKing.position[1]);
        if (!canEnemyKingBeCaptured) return status;
        status.check = true;

        let kingSaviors = this.canSaveKing(board, enemyColor);
        status.kingSaviors.push(...kingSaviors);
        if (kingSaviors.length === 0) status.checkMate = true;

        return status;
    }
    static canSaveKing(board, kingColor) {
        let kingSaviors = []; let kingSavior;

        for (const rankArr of board) {
            for (const square of rankArr) {
                if (!square.piece || 
                    square.piece.color !== kingColor) {
                    continue;
                }
                kingSavior = square.piece;
                
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {

                        if (this.legalMove(board, kingSavior, i, j)) {
                            kingSaviors.push({kingSavior, savingPosition: [i, j]});
                        }
                    }
                }
            }
        }
        return kingSaviors;
    }

    static getEveryLegalMove(board, piece) {
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


export { Rules }