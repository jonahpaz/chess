import { board } from "./board.mjs";
import { dungeon } from "./dungeon.mjs";
import { Move, listOfMoves } from "./moves.mjs";
import { Rules } from "./board-interactions.mjs";
import { Rearrangement } from "./rearrangements.mjs";
import { Console } from "./console.mjs";


class Game {
    constructor(board, dungeon, listOfMoves) {
        this.activePlayer = "white";
        this.board = board;
        this.dungeon = dungeon;
        this.listOfMoves = listOfMoves;
    }
    updateActivePlayer() {
        this.activePlayer = this.activePlayer === "white" ? "black" : "white";
    }
    makeAMove(data) {
        let [piece, rank, file, rook] = 
            [data.piece, data.rank, data.file, data.rook];
        let typeOfMove = rook ?
            Rules.castle(this.board.body, piece, rank, file, rook) : Rules.legalMove(this.board.body, piece, rank, file);
        if (!typeOfMove) return {};

        let movedPieces = [piece]; let capturedPiece, promotion;

        let rearrangementData = {
            typeOfMove, board: this.board.body, piece, rank, file, 
            capturedPiece, rook, movedPieces, promotion, listOfMoves: this.listOfMoves,
        }
        let rearrangement = new Rearrangement(rearrangementData);
            rearrangement.apply();
            piece = rearrangement.piece;
            capturedPiece = rearrangement.capturedPiece;
            promotion = rearrangement.promotion;

        piece.update(rank, file);
        if (capturedPiece) capturedPiece.update(piece.color, "dungeon");
        this.board.updatePoints(capturedPiece, promotion);
        this.dungeon.update(capturedPiece, promotion);

        let status = Rules.checkForCheckMate(this.board.body, piece);
        let moveData = {
            board: this.board.body, typeOfMove, movedPieces, capturedPiece, promotion, status,
        }
        let move = new Move(moveData);
        this.updateActivePlayer();
        let consoleData = {move, board: this.board.body, dungeon: this.dungeon, activePlayer: this.activePlayer}
        Console.log(consoleData);
        return move;
    }
    reset() {
        this.activePlayer = "white";
        this.board.reset();
        this.dungeon.reset();
        this.listOfMoves.length = 0;
    }
}
let game = new Game(board, dungeon, listOfMoves);

export { game }