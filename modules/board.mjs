import { Rules } from "./board-interactions.mjs";
import { Pawn, Bishop, Knight, Rook, Queen, King, piecesMap, rooksMap } from "./pieces.mjs";
import { Move, listOfMoves } from "./moves.mjs";
import { dungeon } from "./dungeon.mjs";


const squaresMap = new Map();
class Square {
    constructor(color, rank, file) {
        this.color = color;
        this.rank = rank;
        this.file = file;
        this.id = crypto.randomUUID();
        squaresMap.set(this.id, this);
    }
}

class Board {
    constructor() {
        this.body = [];
        this.ranks = 8;
        this.files = 8;
        this.variant = "classical";
        this.setEmptyBoard();
        this.setClassicalPositions();
        this.points = {white: 39, black: 39};
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
    
    setClassicalPositions() {
        this.body[0][0].piece = new Rook("black", 0, 0);
        this.body[0][1].piece = new Knight("black", 0, 1);
        this.body[0][2].piece = new Bishop("black", 0, 2);
        this.body[0][3].piece = new Queen("black", 0, 3);
        this.body[0][4].piece = new King("black", 0, 4);
        this.body[0][5].piece = new Bishop("black", 0, 5);
        this.body[0][6].piece = new Knight("black", 0, 6);
        this.body[0][7].piece = new Rook("black", 0, 7);
    
        this.setPawns();
    
        this.body[7][0].piece = new Rook("white", 7, 0);
        this.body[7][1].piece = new Knight("white", 7, 1);
        this.body[7][2].piece = new Bishop("white", 7, 2);
        this.body[7][3].piece = new Queen("white", 7, 3);
        this.body[7][4].piece = new King("white", 7, 4);
        this.body[7][5].piece = new Bishop("white", 7, 5);
        this.body[7][6].piece = new Knight("white", 7, 6);
        this.body[7][7].piece = new Rook("white", 7, 7);

        this.variant = "classical";
    }
    setPawns() {
        for (let j = 0; j < this.files; j++) {
            this.body[1][j].piece = new Pawn("black", 1, j);
            this.body[6][j].piece = new Pawn("white", 6, j);
        }
    }
    setChess960Positions() {
        let files = this.getChess960Files();
        for (const [file, Class] of files.entries()) {
            this.body[0][file].piece = new Class("black", 0, file);
        }
        this.setPawns();
        for (const [file, Class] of files.entries()) {
            this.body[7][file].piece = new Class("white", 7, file);
        }
        this.variant = "chess-960";
    }
    getChess960Files() {
        const files = []; files.length = 8;
        function getAvailableFile() {
            let availableFiles = [];
            for (const [index, file] of files.entries()) {
                if (file) continue;
                availableFiles.push(index);
            }
            let index = Math.floor( Math.random()*availableFiles.length );
            const pieceFile = availableFiles[index];
            return pieceFile;
        }

        const kingFile = Math.floor( 1 + Math.random()*(this.files - 2) );
        const rook1File = Math.floor( Math.random()*kingFile );
        const rook2File = Math.floor( kingFile + 1 + Math.random()*(this.files - 1 - kingFile) );
        files[kingFile] = King; files[rook1File] = Rook; files[rook2File] = Rook;

        const bishop1File = getAvailableFile(); files[bishop1File] = Bishop;
        let bishop2File = bishop1File % 2 === 0 ? 2 : 1;
        while ((bishop1File + bishop2File) % 2 === 0) {bishop2File = getAvailableFile()}
        files[bishop2File] = Bishop;

        const queenFile = getAvailableFile(); files[queenFile] = Queen;
        const knight1File = getAvailableFile(); files[knight1File] = Knight;
        const knight2File = getAvailableFile(); files[knight2File] = Knight;

        return files;
    }
    
    updatePoints(capturedPiece, promotion) {
        if (capturedPiece) this.points[capturedPiece.color] -= capturedPiece.points;
        if (promotion) this.points[promotion.piece.color] += promotion.piece.points - 1;
    }

    updateBody(piece, rank, file, rook) {
        let typeOfMove = rook ?
            Rules.castle(this.body, piece, rank, file, rook)
            : Rules.legalMove(this.body, piece, rank, file);
        if (!typeOfMove) return {};
        
        let movedPieces = [piece];   let capturedPiece, promotion;

        if (typeOfMove === "move" || typeOfMove === "capture") {
            capturedPiece = this.body[rank][file].piece;
            delete this.body[piece.position[0]][piece.position[1]].piece;

            promotion = Rules.promote(piece, rank, file);
            if (promotion) piece = promotion.piece;

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

        piece.update(rank, file);
        if (capturedPiece) capturedPiece.update(piece.color, "dungeon");
        this.updatePoints(capturedPiece, promotion);
        let status = Rules.checkForCheckMate(this.body, piece);
        dungeon.update(capturedPiece, promotion);
        let move = new Move(this.body, typeOfMove, movedPieces, capturedPiece, promotion, status);
        console.log(move);/////////////////console
        this.displayConsoleBoard();////////console
        console.log(dungeon);//////////////console
        return move;
    }

    resetBoard() {
        piecesMap.clear();
        rooksMap.get("white").length = 0;
        rooksMap.get("black").length = 0;
        for (const rank of board.body) {
            for (const square of rank) {
                delete square.piece;
            }
        }
        if (this.variant === "classical") this.setClassicalPositions();
        if (this.variant === "chess-960") this.setChess960Positions();
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
const board = new Board();

export { board, squaresMap }