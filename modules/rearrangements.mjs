import { Rules } from "./board-interactions.mjs";


class Rearrangement {
    constructor(data) {
        this.typeOfMove = data.typeOfMove;
        this.board = data.board;
        this.piece = data.piece;
        this.rank = data.rank;
        this.file = data.file;
        this.capturedPiece = data.capturedPiece;
        this.rook = data.rook;
        this.movedPieces = data.movedPieces;
        this.promotion = data.promotion;
        this.listOfMoves = data.listOfMoves;
    }
    apply() {
        switch (this.typeOfMove) {
            case "move": this.moveOrCapture(); break;
            case "capture": this.moveOrCapture(); break;
            case "castle": this.castle(); break;
            case "enPassant": this.enPassant(); break;
        }
    }
    moveOrCapture() {
        this.capturedPiece = this.board[this.rank][this.file].piece;
        delete this.board[this.piece.position[0]][this.piece.position[1]].piece;
        this.promotion = Rules.promote(this.piece, this.rank, this.file);
        if (this.promotion) this.piece = this.promotion.piece;
        this.board[this.rank][this.file].piece = this.piece;
    }
    castle() {
        this.rook = this.rook ? this.rook : this.piece.getRookForCastle(this.file);
        delete this.board[this.piece.position[0]][this.piece.position[1]].piece;
        delete this.board[this.piece.position[0]][this.rook.position[1]].piece;
        this.board[this.rank][this.file].piece = this.piece;
        this.board[this.rank][this.rook.castleFile].piece = this.rook;
        this.rook.update(this.rank, this.rook.castleFile);
        this.movedPieces.push(this.rook);
    }
    enPassant() {
        this.capturedPiece = this.listOfMoves[this.listOfMoves.length - 1].movedPieces[0];
        delete this.board[this.piece.position[0]][this.piece.position[1]].piece;
        this.board[this.rank][this.file].piece = this.piece;
        delete this.board[this.capturedPiece.position[0]][this.capturedPiece.position[1]].piece;
    }
}

export { Rearrangement }