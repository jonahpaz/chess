import { board } from "./board.mjs";
import { Piece } from "./pieces.mjs";
import { Rules } from "./board-interactions.mjs";


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
        squareDiv.dataset.rank = square.rank;
        squareDiv.dataset.file = square.file;
        squareDiv.classList.add("square", square.color);

        updateElementMap(square, squareDiv);

        return squareDiv;
    }

    static getPieceButton(piece) {
        const pieceButton = document.createElement("button");
        pieceButton.classList.add("piece");
        pieceButton.dataset.name = piece.name;
        pieceButton.dataset.color = piece.color;
        pieceButton.textContent = piece.name;

        pieceButton.dataset.rank = piece.position[0];
        pieceButton.dataset.file = piece.position[1];

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


    static setListeners() {
        DisplayController.boardDiv.addEventListener("click", this.activatePieceButton.bind(DisplayController));
        DisplayController.boardDiv.addEventListener("click", this.updateBoardDiv.bind(DisplayController));
        DisplayController.boardDiv.addEventListener("click", this.highlightLegalMoves.bind(DisplayController));
    }
    
    static activatePieceButton(event) {
        let pieceButton = event.target;
        if (!pieceButton.classList.contains("piece")) return false;

        if (pieceButton.dataset.color !== this.#activePlayer) return false;

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
    static highlightLegalMoves() {
        let activeButton = DisplayController.boardDiv.querySelector(".active");
        if (!activeButton) return;
        let activePiece = pieceButtonMap.get(activeButton.dataset.id);
        let positions = Rules.getEveryLegalMove(board.body, activePiece);
        positions.forEach(
            position => {
                let rank = position[0];
                let file = position[1];
                let square = DisplayController.boardDiv.children[rank].children[file];
                square.classList.add("legalMove");
            }
        );
    }
    static updateBoardDiv(event) {
        let activePieceButton = DisplayController.boardDiv.querySelector(".active");
        if (!activePieceButton) return;
        if (activePieceButton.dataset.color !== this.#activePlayer) return;

        let newPosition = event.target;
        
        let rank = +newPosition.dataset.rank;
        let file = +newPosition.dataset.file;

        let activeId = activePieceButton.dataset.id;
        let activePiece = pieceButtonMap.get(activeId);

        let move = board.update(activePiece, rank, file);
        if (move.typeOfMove) {
                this.emptyBoard();
                this.printPieces();

                activePieceButton.dataset.rank = rank;
                activePieceButton.dataset.file = file;
                activePieceButton.classList.remove("active");

                if (!move.checkMate) this.updateActivePlayer();
                this.removeHighlight();
        }
        if (move.checkMate) this.gameOver();
    }

    static updateCementeryDiv(update) {
        if (update.capturedPiece) {
            let capturedButton = pieceButtonMap.get(update.capturedPiece.id);
        
        }
    }

    static removeHighlight() {
        let squares = DisplayController.boardDiv.querySelectorAll(".legalMove");
        squares.forEach(
            square => square.classList.remove("legalMove")
        );
    }
    static printPieces() {
        for (const rankDiv of DisplayController.boardDiv.children) {
            for (const squareDiv of rankDiv.children) {
                let id = squareDiv.dataset.id;
                let square = squareDivMap.get(id);

                if (!square.piece) continue;
                let pieceButton = DomEl.getPieceButton(square.piece);
                squareDiv.appendChild(pieceButton);
            }
        }
    }
    static emptyBoard () {
        for (const rankDiv of DisplayController.boardDiv.children) {
            for (const squareDiv of rankDiv.children) {
                squareDiv.innerHTML = "";
            }
        }
    }


    static updateActivePlayer() {
        this.#activePlayer = this.#activePlayer === "white" ? "black" : "white";
        console.log(`
            It is ${this.#activePlayer}'s turn.`);
    }
    static gameOver() {
        let pieceButtons = DisplayController.boardDiv.querySelectorAll(".piece");
        for (const button of pieceButtons) {
            button.disabled = true;
        }
    }
    static get activeKing() {
        let activeKingButton = 
            DisplayController.boardDiv.querySelector(`[data-name = "King"][data-color = ${this.#activePlayer}]`);
        let activeId = activeKingButton.dataset.id;
        let activeKing = pieceButtonMap.get(activeId);
        return activeKing;
    }


    static setEmptyBoard() {
        board.body.forEach( 
            rank => {
                let rankDiv = document.createElement("div");
                rankDiv.classList.add("rank");

                rank.forEach(
                    square => {
                        let squareDiv = DomEl.getSquareDiv(square);
                        rankDiv.appendChild(squareDiv);
                    }
                );

                DisplayController.boardDiv.appendChild(rankDiv);
            }
        );
    }
}


DisplayController.setEmptyBoard();
DisplayController.printPieces();
DisplayController.setListeners();

board.displayConsoleBoard();
console.log(`
    It is white's turn.`);

export { DisplayController }