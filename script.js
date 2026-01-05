// const pubsub = {
//     events: {},
//     suscribe: (event, action) => {
//         this.events[event] = this.events[event] || [];
//         this.events[event].push(action);
//     }, 
//     unsuscribe: (event, action) => {
//         if (this.events[event]) {
//             this.events[event] = this.events[event].filter(action);
//         }
//     },
//     publish: (event, data) => {
//         if (this.events[event]) {
//             this.events[event].forEach(action => action(data));
//         }
//     },
// }

const pieceButtonRefs = new Map();
const squareDivRefs = new Map();

class Piece {
    constructor(row, column) {
        this.position = [row, column];
        this.initialPosition = [row, column];
        this.lastPosition = [row, column];
        this.id = crypto.randomUUID();
    }
    move(row, column) {
        if (board.getBoard()[row][column].piece) return false;

        let rowChange = row - this.position[0];
        let columnChange = column - this.position[1];
        if (!this.legalMovePath(rowChange, columnChange)) return false;

        if ((this instanceof Bishop || this instanceof Rook || 
            this instanceof Queen || this instanceof Pawn)
            && this.checkObstacules(row, column, rowChange, columnChange)) return false;

        delete board.getBoard()[this.position[0]][this.position[1]].piece;
        this.lastPosition = [...this.position];
        this.position = [row, column];
        board.getBoard()[row][column].piece = this;

        // let piece = this;
        // pubsub.publish("pieceMoved", piece);

        return true;
    }
    capture(row, column) {
        if (!board.getBoard()[row][column].piece) return false;
        if (board.getBoard()[row][column].piece.name === "King") return false;

        let rowChange = row - this.position[0];
        let columnChange = column - this.position[1];
        if (!this.legalCapturePath(rowChange, columnChange)) return false;

        if (board.getBoard()[row][column].piece.color === this.color) return false;
        if ((this instanceof Bishop || this instanceof Rook || this instanceof Queen)
            && this.checkObstacules(row, column, rowChange, columnChange)) return false;

        delete board.getBoard()[this.position[0]][this.position[1]].piece;
        this.lastPosition = [...this.position];
        this.position = [row, column];
        board.getBoard()[row][column].piece = this;

        // let piece = this;
        // pubsub.publish("pieceCapturing", piece);

        return true;
    }

    getHypotheticalMovesAndCaptures() {
        const hypotheticalMovesAndCaptures = [];
        for (let i = 0; i < 8; i++) {
            let rowChange = i - this.position[0];

            for (let j = 0; j < 8; j++) {
                let columnChange = j - this.position[1];

                if (this.legalMovePath(rowChange, columnChange) || 
                    this.legalCapturePath(rowChange, columnChange)) {
                    let potentialMove = [i, j];
                    hypotheticalMovesAndCaptures.push(potentialMove);
                }
            }
        }
        return hypotheticalMovesAndCaptures;
    }

    getPotentialCaptures() {
        const potentialCaptures = [];
        for (let i = 0; i < 8; i++) {
            let rowChange = i - this.position[0];

            for (let j = 0; j < 8; j++) {
                let columnChange = j - this.position[1];

                if (this.legalCapturePath(rowChange, columnChange)) {
                    let potentialMove = [i, j];
                    potentialCaptures.push(potentialMove);
                }
            }
        }
        return potentialCaptures;
    }

    checkObstacules(row, column, rowChange, columnChange) {
        let j = this.position[1];
        let i = this.position[0];

        while ( !(i === row && j === column) ) {
            if (rowChange < 0) {i--} else if (rowChange > 0) {i++} 
            else if (rowChange === 0) {i === row}

            if (columnChange < 0) {j--} else if (columnChange > 0) {j++} 
            else if (columnChange === 0) {j === column}

            if (i === row && j === column) continue;

            if (board.getBoard()[i][j].piece) return true;
        }

        return false;
    }

    getPieceButton() {
        const pieceButton = document.createElement("button");
        pieceButton.classList.add("piece");
        pieceButton.dataset.name = this.name;
        pieceButton.dataset.color = this.color;
        pieceButton.dataset.name = this.name;
        pieceButton.textContent = this.name;

        pieceButton.dataset.row = this.position[0];
        pieceButton.dataset.column = this.position[1];

        pieceButton.dataset.id = this.id;
        pieceButtonRefs.set(this.id, this);

        return pieceButton;
    }
}

class Pawn extends Piece{
    constructor(color, row, column){
        super(row, column);
        this.name = "Pawn";
        this.color = color; 

        // let piece = this;
        // pubsub.publish("pieceCreated", piece);
    }
    legalMovePath(rowChange, columnChange) {
        if (rowChange > 0 && this.color === "white") {return false}
        if (rowChange < 0 && this.color === "black") {return false}
        if (columnChange === 0) {
            if (Math.abs(rowChange) === 1) {
                return true;
            } else if (Math.abs(rowChange) === 2 
                && this.initialPosition[0] === this.position[0]) {  
                return true;
            }
        } else {return false}
    }
    legalCapturePath(rowChange, columnChange) {
        if (rowChange > 0 && this.color === "white") {return false}
        if (rowChange < 0 && this.color === "black") {return false}
        if (Math.abs(columnChange) === 1 && Math.abs(rowChange) === 1) {
            return true;
        } else {return false} //gotta define en-passant 

    }
    enPassant(row, column) {
        if (listOfMoves.length === 0) return false;

        let lastMovedPiece = listOfMoves[listOfMoves.length - 1].piece;
        let lastRowChange = 
            Math.abs(lastMovedPiece.position[0] - lastMovedPiece.lastPosition[0]);
        if ( !(lastMovedPiece instanceof Pawn && lastRowChange === 2) ) return false;

        let lastPieceRow = lastMovedPiece.position[0];
        let lastPieceColumn = lastMovedPiece.position[1];
        let activePieceRow = this.position[0];
        let activePieceColumn = this.position[1];
        if ( !(Math.abs(lastPieceColumn - activePieceColumn) === 1 
                && lastPieceRow === activePieceRow
                && column === lastPieceColumn) ) return false;

        let rowChange = row - this.position[0];
        let columnChange = column - this.position[1];
        if (!this.legalCapturePath(rowChange, columnChange)) return false;

        return true;
    }
    capture(row, column) {
        //This capture method is exclusive for Pawn to check en-passant.
        if (this.enPassant(row, column)) {
            delete board.getBoard()[this.position[0]][this.position[1]].piece;
            this.lastPosition = [...this.position];
            this.position = [row, column];
            board.getBoard()[row][column].piece = this;
            
            let lastMove = listOfMoves[listOfMoves.length -1];
            delete board.getBoard()[lastMove.row][lastMove.column].piece;
            return true;

        } else {
            if (super.capture(row, column)) {
                return true
            } else {return false}
        }
    }
}

class Bishop extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "Bishop";
        this.color = color;

        // let piece = this;
        // pubsub.publish("pieceCreated", piece);
    }
    legalMovePath(rowChange, columnChange) {
        if (Math.abs(rowChange) === Math.abs(columnChange)) {
            return true;
        } else {return false}
    }
}
Bishop.prototype.legalCapturePath = Bishop.prototype.legalMovePath;

class Knight extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "Knight";
        this.color = color;

        // let piece = this;
        // pubsub.publish("pieceCreated", piece);
    }
    legalMovePath(rowChange, columnChange) {
        if ((Math.abs(rowChange) === 1 && Math.abs(columnChange) === 2) ||
            (Math.abs(rowChange) === 2 && Math.abs(columnChange) === 1)) {
            return true;
        } else {return false}
    }
}
Knight.prototype.legalCapturePath = Knight.prototype.legalMovePath;

class Rook extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "Rook";
        this.color = color;

        // let piece = this;
        // pubsub.publish("pieceCreated", piece);
    }
    legalMovePath(rowChange, columnChange) {
        if ((Math.abs(rowChange) > 0 && columnChange === 0) ||
            (rowChange === 0 && Math.abs(columnChange) > 0)) {
            return true;
        } else {return false}
    }
}
Rook.prototype.legalCapturePath = Rook.prototype.legalMovePath;

class Queen extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "Queen";
        this.color = color;

        // let piece = this;
        // pubsub.publish("pieceCreated", piece);
    }
    legalMovePath(rowChange, columnChange) {
        if ((Math.abs(rowChange) > 0 && columnChange === 0) ||
            (rowChange === 0 && Math.abs(columnChange) > 0) ||
            (Math.abs(rowChange) === Math.abs(columnChange))) {
            return true;
        } else {return false}
    }
}
Queen.prototype.legalCapturePath = Queen.prototype.legalMovePath;

class King extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "King";
        this.color = color;

        // let piece = this;
        // pubsub.publish("pieceCreated", piece);
    }
    legalMovePath(rowChange, columnChange) {
        if ((Math.abs(rowChange) === 1 && Math.abs(columnChange) === 1) ||
            (Math.abs(rowChange) === 1 && columnChange === 0) ||
            (rowChange === 0 && Math.abs(columnChange) === 1))  {
            return true;
        } else {return false}
    }
    kingsLegalDistance(row, column) {
        if (row === this.position[0] && column === this.position[1]) return;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                if (row + i < 0 || column + j < 0) continue;
                let newNeighbourPiece = board.getBoard()[row + i][column + j].piece;
                if (newNeighbourPiece instanceof King && newNeighbourPiece !== this)
                    return false;
            }
        }
        return true;
    }
    move(row, column) {
        if (!this.kingsLegalDistance(row, column)) return false;
        if (super.move(row, column)) {return true} else {return false};

    }
    capture(row, column) {
        if (!this.kingsLegalDistance(row, column)) return false;
        if (super.capture(row, column)) {return true} else {return false};

    }
}
King.prototype.legalCapturePath = King.prototype.legalMovePath;

    //Definir trayectoria y checks

// return {
//     Piece, Pawn, Bishop, Knight, Rook, Queen, King,
// };

// })();


class Square {
    constructor(color, row, column) {
        this.color = color;
        this.row = row;
        this.column = column;
        this.id = crypto.randomUUID();
    }

    getSquareDiv() {
        let squareDiv = document.createElement("div");
        squareDiv.dataset.row = this.row;
        squareDiv.dataset.column = this.column;
        squareDiv.classList.add("square", this.color);

        squareDiv.dataset.id = this.id;
        squareDivRefs.set(this.id, this);

        return squareDiv;
    }
}

const board = (() => {
    const rows = 8;
    const columns = 8;
    const board = [];
    const getBoard = () => board;

    const allPossiblePositions = [];
    const getAllPossiblePositions = () => allPossiblePositions;

    const setEmptyBoard = () => {
        let color = "white";
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < columns; j++) {
                row.push(new Square(color, i, j));
                allPossiblePositions.push([i,j]);
                color = color === "white"? "black": "white";     
            }
            color = color === "white"? "black": "white";  
            board.push(row);
        }
    }
    setEmptyBoard();

    const setInitialPositions = () => {
        board[0][0].piece = new Rook("black", 0, 0);
        board[0][1].piece = new Knight("black", 0, 1);
        board[0][2].piece = new Bishop("black", 0, 2);
        board[0][3].piece = new Queen("black", 0, 3);
        board[0][4].piece = new King("black", 0, 4);
        board[0][5].piece = new Bishop("black", 0, 5);
        board[0][6].piece = new Knight("black", 0, 6);
        board[0][7].piece = new Rook("black", 0, 7);

        for (let j = 0; j < columns; j++) {
            board[1][j].piece = new Pawn("black", 1, j);
            board[6][j].piece = new Pawn("white", 6, j);
        }

        board[7][0].piece = new Rook("white", 7, 0);
        board[7][1].piece = new Knight("white", 7, 1);
        board[7][2].piece = new Bishop("white", 7, 2);
        board[7][3].piece = new Queen("white", 7, 3);
        board[7][4].piece = new King("white", 7, 4);
        board[7][5].piece = new Bishop("white", 7, 5);
        board[7][6].piece = new Knight("white", 7, 6);
        board[7][7].piece = new Rook("white", 7, 7);
    }
    setInitialPositions();

    const resetBoard = () => {
        board.length = 0;
        setEmptyBoard();
        setInitialPositions();
    }
    return {
        getBoard, 
        resetBoard, 
        getAllPossiblePositions, 
    }
})();


const listOfMoves = [];

const displayController = () => {
    const boardDiv = document.querySelector(".board");

    function setEmptyBoard() {
        board.getBoard().forEach( 
            row => {
                let rowDiv = document.createElement("div");
                rowDiv.classList.add("row");

                row.forEach(
                    square => {
                        let squareDiv = square.getSquareDiv();
                        rowDiv.appendChild(squareDiv);
                    }
                );

                boardDiv.appendChild(rowDiv);
            }
        );
    }
    setEmptyBoard();

    function printPieces() {
        for (const rowDiv of boardDiv.children) {
            for (const squareDiv of rowDiv.children) {
                let id = squareDiv.dataset.id;
                let square = squareDivRefs.get(id);

                if (!square.piece) continue;
                let pieceButton = square.piece.getPieceButton();
                squareDiv.appendChild(pieceButton);
            }
        }
    }
    printPieces();

    function emptyBoard () {
        for (const rowDiv of boardDiv.children) {
            for (const squareDiv of rowDiv.children) {
                squareDiv.innerHTML = "";
            }
        }
    }
    
    function activatePieceButton(event) {
        let pieceButton = event.target;
        if (!pieceButton.classList.contains("piece")) return;
        if (pieceButton.dataset.color !== activePlayer) return;

        if (!boardDiv.querySelector(".active")) {
            pieceButton.classList.add("active");

        } else {
            let lastActiveButton = boardDiv.querySelector(".active");

                if (lastActiveButton.dataset.color === pieceButton.dataset.color) {
                    lastActiveButton.classList.remove("active");
                    pieceButton.classList.add("active");
                    removeHighlight();
                }
        }
    }

    function moveOrCaptureButton(event) {
        let activePieceButton = boardDiv.querySelector(".active");
        if (!activePieceButton) return;
        if (activePieceButton.dataset.color !== activePlayer) return;

        let newPosition = event.target;
        
        let row = +newPosition.dataset.row;
        let column = +newPosition.dataset.column;

        let activeId = activePieceButton.dataset.id;
        let activePiece = pieceButtonRefs.get(activeId);

        if (activePiece.move(row, column) || activePiece.capture(row, column)) {
                emptyBoard();
                printPieces();
                activePieceButton.dataset.row = row;
                activePieceButton.dataset.column = column;
                activePieceButton.classList.remove("active");

                let move = {player: activePlayer, piece: activePiece, row, column};
                listOfMoves.push(move);
                activePlayer = activePlayer === "white" ? "black" : "white";
                console.log(`It is ${activePlayer}'s turn`);
                removeHighlight();
        }
        if (activePiece.enPassant && activePiece.enPassant(row, column)) {
            console.log(activePiece.enPassant(row, column));
            let lastMovedPiece = listOfMoves[listOfMoves.length - 1].piece;
            let lastId = lastMovedPiece.id;
            let lastButtonMoved = boardDiv.querySelector(`[data-id = "${lastId}"]`);
            lastButtonMoved.remove();
        }
    }

    function highlightHypotheticalPaths() {
        let activeButton = boardDiv.querySelector(".active");
        if (!activeButton) return;
        let activePiece = pieceButtonRefs.get(activeButton.dataset.id);
        let positions = activePiece.getHypotheticalMovesAndCaptures();
        positions.forEach(
            position => {
                let row = position[0];
                let column = position[1];
                let square = boardDiv.children[row].children[column];
                square.classList.add("hypotheticalPosition");
            }
        );
    }

    function removeHighlight() {
        let squares = boardDiv.querySelectorAll(".hypotheticalPosition");
        squares.forEach(
            square => square.classList.remove("hypotheticalPosition")
        );
    }

    boardDiv.addEventListener("click", activatePieceButton);
    boardDiv.addEventListener("click", highlightHypotheticalPaths);
    boardDiv.addEventListener("click", moveOrCaptureButton);

    let activePlayer = "white";

    console.log(`It is ${activePlayer}'s turn`);
}
displayController();


//Definir turnos truncar move con piezas obstaculo en la trayectoria
//y definir checks

