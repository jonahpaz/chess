import { Board } from "./board.mjs";
import { listOfMoves } from "./board-interactions.mjs";
import { Piece } from "./pieces.mjs";
import { BoardInteractions } from "./board-interactions.mjs";


const pieceButtonMap = new Map();
const squareDivMap = new Map();

function updateElementMap(obj, element) {
    element.dataset.id = obj.id;

    obj instanceof Piece ?
    pieceButtonMap.set(obj.id, obj)
    : squareDivMap.set(obj.id, obj);
}

class DomEl {
    static getSquareDiv(square) {
        let squareDiv = document.createElement("div");
        squareDiv.dataset.row = square.row;
        squareDiv.dataset.column = square.column;
        squareDiv.classList.add("square", square.color);

        updateElementMap(square, squareDiv);

        return squareDiv;
    }

    static getPieceButton(piece) {
        const pieceButton = document.createElement("button");
        pieceButton.classList.add("piece");
        pieceButton.dataset.name = piece.name;
        pieceButton.dataset.color = piece.color;
        pieceButton.dataset.name = piece.name;
        pieceButton.textContent = piece.name;

        pieceButton.dataset.row = piece.position[0];
        pieceButton.dataset.column = piece.position[1];

        updateElementMap(piece, pieceButton);

        return pieceButton;
    }
}

class DisplayController {
    static #boardDiv = document.querySelector(".board");
    static get boardDiv() {
        return this.#boardDiv;
    }

    static #activePlayer = "white";

    static get activeKing() {
        let activeKingButton = 
            DisplayController.boardDiv.querySelector(`[data-name = "King"][data-color = ${this.#activePlayer}]`);
        let activeId = activeKingButton.dataset.id;
        let activeKing = pieceButtonMap.get(activeId);
        return activeKing;
    }

    static setEmptyBoard() {
        Board.board.forEach( 
            row => {
                let rowDiv = document.createElement("div");
                rowDiv.classList.add("row");

                row.forEach(
                    square => {
                        let squareDiv = DomEl.getSquareDiv(square);
                        rowDiv.appendChild(squareDiv);
                    }
                );

                DisplayController.boardDiv.appendChild(rowDiv);
            }
        );
    }
    static printPieces() {
        for (const rowDiv of DisplayController.boardDiv.children) {
            for (const squareDiv of rowDiv.children) {
                let id = squareDiv.dataset.id;
                let square = squareDivMap.get(id);

                if (!square.piece) continue;
                let pieceButton = DomEl.getPieceButton(square.piece);
                squareDiv.appendChild(pieceButton);
            }
        }
    }
    static emptyBoard () {
        for (const rowDiv of DisplayController.boardDiv.children) {
            for (const squareDiv of rowDiv.children) {
                squareDiv.innerHTML = "";
            }
        }
    }
    
    static activatePieceButton(event) {
        let pieceButton = event.target;
        if (!pieceButton.classList.contains("piece")) return;
        if (pieceButton.dataset.color !== this.#activePlayer) return;

        if (!DisplayController.boardDiv.querySelector(".active")) {
            pieceButton.classList.add("active");

        } else {
            let lastActiveButton = DisplayController.boardDiv.querySelector(".active");

                if (lastActiveButton.dataset.color === pieceButton.dataset.color) {
                    lastActiveButton.classList.remove("active");
                    pieceButton.classList.add("active");
                    this.removeHighlight();
                }
        }
    }
    static moveOrCaptureButton(event) {
        let activePieceButton = DisplayController.boardDiv.querySelector(".active");
        if (!activePieceButton) return;
        if (activePieceButton.dataset.color !== this.#activePlayer) return;

        let newPosition = event.target;
        
        let row = +newPosition.dataset.row;
        let column = +newPosition.dataset.column;

        let activeId = activePieceButton.dataset.id;
        let activePiece = pieceButtonMap.get(activeId);

        if (BoardInteractions.rearrangeBoardPieces(Board.board, activePiece, row, column)) {
                
                this.emptyBoard();
                this.printPieces();

                activePieceButton.dataset.row = row;
                activePieceButton.dataset.column = column;
                activePieceButton.classList.remove("active");

                this.updateListOfMoves(activePiece, row, column);
                this.updateActivePlayer();
                this.removeHighlight();
                // Board.displayConsoleBoard();
        }
    }

    static updateListOfMoves(activePiece, row, column) {
        let move = {player: this.#activePlayer, piece: activePiece, row, column};
        listOfMoves.push(move);
    }
    static updateActivePlayer() {
        this.#activePlayer = this.#activePlayer === "white" ? "black" : "white";
        console.log(`
            It is ${this.#activePlayer}'s turn.`);
    }

    static highlightHypotheticalPaths() {
        let activeButton = DisplayController.boardDiv.querySelector(".active");
        if (!activeButton) return;
        let activePiece = pieceButtonMap.get(activeButton.dataset.id);
        let positions = activePiece.getHypotheticalMovesAndCaptures();
        positions.forEach(
            position => {
                let row = position[0];
                let column = position[1];
                let square = DisplayController.boardDiv.children[row].children[column];
                square.classList.add("hypotheticalPosition");
            }
        );
    }
    static removeHighlight() {
        let squares = DisplayController.boardDiv.querySelectorAll(".hypotheticalPosition");
        squares.forEach(
            square => square.classList.remove("hypotheticalPosition")
        );
    }

    static setListeners() {
        DisplayController.boardDiv.addEventListener("click", this.activatePieceButton.bind(DisplayController));
        DisplayController.boardDiv.addEventListener("click", this.highlightHypotheticalPaths.bind(DisplayController));
        DisplayController.boardDiv.addEventListener("click", this.moveOrCaptureButton.bind(DisplayController));
    }
}


Board.setEmptyBoard();
Board.setInitialPositions();

DisplayController.setEmptyBoard();
DisplayController.printPieces();
DisplayController.setListeners();