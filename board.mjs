import { Pawn, Bishop, Knight, Rook, Queen, King } from "./pieces.mjs";


class Square {
    constructor(color, row, column) {
        this.color = color;
        this.row = row;
        this.column = column;
        this.id = crypto.randomUUID();
    }
}

class Board {
    static #board = [];
    static get board() { 
        return this.#board;
    };

    static rows = 8;
    static columns = 8;

    static setEmptyBoard() {
        let color = "white";
        for (let i = 0; i < this.rows; i++) {
            let row = [];
            for (let j = 0; j < this.columns; j++) {
                row.push(new Square(color, i, j));
                color = color === "white"? "black": "white";     
            }
            color = color === "white"? "black": "white";  
            Board.board.push(row);
        }
    }
    
    static setInitialPositions() {
        Board.board[0][0].piece = new Rook("black", 0, 0);
        Board.board[0][1].piece = new Knight("black", 0, 1);
        Board.board[0][2].piece = new Bishop("black", 0, 2);
        Board.board[0][3].piece = new Queen("black", 0, 3);
        Board.board[0][4].piece = new King("black", 0, 4);
        Board.board[0][5].piece = new Bishop("black", 0, 5);
        Board.board[0][6].piece = new Knight("black", 0, 6);
        Board.board[0][7].piece = new Rook("black", 0, 7);
    
        for (let j = 0; j < this.columns; j++) {
            Board.board[1][j].piece = new Pawn("black", 1, j);
            Board.board[6][j].piece = new Pawn("white", 6, j);
        }
    
        Board.board[7][0].piece = new Rook("white", 7, 0);
        Board.board[7][1].piece = new Knight("white", 7, 1);
        Board.board[7][2].piece = new Bishop("white", 7, 2);
        Board.board[7][3].piece = new Queen("white", 7, 3);
        Board.board[7][4].piece = new King("white", 7, 4);
        Board.board[7][5].piece = new Bishop("white", 7, 5);
        Board.board[7][6].piece = new Knight("white", 7, 6);
        Board.board[7][7].piece = new Rook("white", 7, 7);

        this.displayConsoleBoard();
        console.log(`
            It is white's turn.`);
    }

    // static resetBoard() {
    //     Board.board.length = 0;
    //     setEmptyBoard();
    //     setInitialPositions();
    // }

    static displayConsoleBoard() {
        let consoleBoard = [];
        Board.board.forEach(row => {
            let consoleRow = [];

            row.forEach(square => {
                let consoleSquare = square.piece? 
                    `${square.piece.color[0].toUpperCase()}-${square.piece.name.slice(0,2)}` 
                    : `--${square.color[0]}-`;
                consoleRow.push(consoleSquare);
            });

            consoleBoard.push(consoleRow);
        });
        console.log(consoleBoard);
    }
}

const alphabet = "abcdefgh";

function numToLetterStringMethod(n) {
    return alphabet.charAt(n-1); 
} //to refactor the board

export { Board }


//alphabetical columns and nummerical rows [a,1];
//refactor everything to go along the traditional board naming system uuhgg...