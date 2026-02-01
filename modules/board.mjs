import { Rules } from "./board-interactions.mjs";
import { Pawn, Bishop, Knight, Rook, Queen, King } from "./pieces.mjs";
import { Move, listOfMoves } from "./moves.mjs";

class Square {
    constructor(color, rank, file) {
        this.color = color;
        this.rank = rank;
        this.file = file;
        this.id = crypto.randomUUID();
    }
}

class Board {
    constructor() {
        this.body = [];
        this.ranks = 8;
        this.files = 8;
        this.setEmptyBoard();
        this.setClassicalInitialPositions();
    }

    setEmptyBoard() {
        let color = "white";
        for (let i = 0; i < this.ranks; i++) {
            let rank = [];
            for (let j = 0; j < this.files; j++) {
                rank.push(new Square(color, i, j));
                color = color === "white"? "black": "white";     
            }
            color = color === "white"? "black": "white";  
            this.body.push(rank);
        }
    }
    
    setClassicalInitialPositions() {
        this.body[0][0].piece = new Rook("black", 0, 0);
        this.body[0][1].piece = new Knight("black", 0, 1);
        this.body[0][2].piece = new Bishop("black", 0, 2);
        this.body[0][3].piece = new Queen("black", 0, 3);
        this.body[0][4].piece = new King("black", 0, 4);
        this.body[0][5].piece = new Bishop("black", 0, 5);
        this.body[0][6].piece = new Knight("black", 0, 6);
        this.body[0][7].piece = new Rook("black", 0, 7);
    
        for (let j = 0; j < this.files; j++) {
            this.body[1][j].piece = new Pawn("black", 1, j);
            this.body[6][j].piece = new Pawn("white", 6, j);
        }
    
        this.body[7][0].piece = new Rook("white", 7, 0);
        this.body[7][1].piece = new Knight("white", 7, 1);
        this.body[7][2].piece = new Bishop("white", 7, 2);
        this.body[7][3].piece = new Queen("white", 7, 3);
        this.body[7][4].piece = new King("white", 7, 4);
        this.body[7][5].piece = new Bishop("white", 7, 5);
        this.body[7][6].piece = new Knight("white", 7, 6);
        this.body[7][7].piece = new Rook("white", 7, 7);
    }

    update(piece, rank, file) {
        let typeOfMove = Rules.legalMove(this.body, piece, rank, file);
        if (!typeOfMove) return {};
        
        let movedPieces = [piece];   let capturedPiece;

        if (typeOfMove === "move" || typeOfMove === "capture") {
            capturedPiece = this.body[rank][file].piece;
            delete this.body[piece.position[0]][piece.position[1]].piece;

            let promotion = Rules.promote(this.body, piece, rank, file);
            if (promotion) piece = promotion;
            this.body[rank][file].piece = piece;
        } else

        if (typeOfMove === "castle") {
            let rook = piece.getRookForCastle(file);

            delete this.body[piece.position[0]][piece.position[1]].piece;
            delete this.body[rook.position[0]][rook.position[1]].piece;
            this.body[rank][file].piece = piece;
            this.body[rank][rook.castleFile].piece = rook;

            rook.update(rank, rook.castleFile);
            movedPieces.push(rook);
        }

        if (typeOfMove === "enPassant") {
            capturedPiece = listOfMoves[listOfMoves.length - 1].movedPieces[0];

            delete this.body[piece.position[0]][piece.position[1]].piece;
            this.body[rank][file].piece = piece;
            delete this.body[capturedPiece.position[0]][capturedPiece.position[1]].piece;
        }

        if (capturedPiece) capturedPiece.update(piece.color, "cementery");
        piece.update(rank, file);

        let status = Rules.checkForCheckMate(this.body, piece);

        let move = new Move(this.body, typeOfMove, movedPieces, capturedPiece, status);
        console.log(move);
        this.displayConsoleBoard();
        return move;
    }

    resetBoard() {
        this.body.length = 0;
        setEmptyBoard();
        setClassicalInitialPositions();
    }

    displayConsoleBoard() { //Just to check on the console easily;
        let consoleBoard = [];
        this.body.forEach(rank => {
            let consoleRank = [];

            rank.forEach(square => {
                let consoleSquare = square.piece? 
                    `${square.piece.color[0].toUpperCase()}-${square.piece.name.slice(0,2)}` 
                    : `--${square.color[0]}-`;
                consoleRank.push(consoleSquare);
            });

            consoleBoard.push(consoleRank);
        });
        console.log(consoleBoard);
    }
}

class Cementery {
    constructor() {
        this.white = new Map([
            [Queen, []], [Rook, []], [Bishop, []], [Knight, []], [Pawn, []],
        ]);
        this.black = new Map([
            [Queen, []], [Rook, []], [Bishop, []], [Knight, []], [Pawn, []],
        ]);
    }
    add(capturedPiece) {
        let color = capturedPiece.color;
        let Piece = Object.getPrototypeOf(capturedPiece);
        this[color].get(Piece).push(capturedPiece);
    }
    remove(capturedPiece){
        let color = capturedPiece.color;
        let Piece = Object.getPrototypeOf(capturedPiece);
        this[color].get(Piece).pop();
    }
    reset() {
        for (value of this.white.values()) {
            value = [];
        }
        for (value of this.black.values()) {
            value = [];
        }
    }
}

const board = new Board();
const cementery = new Cementery();


export { board, cementery }