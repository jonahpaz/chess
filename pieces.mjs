import { BoardRules } from "./board-rules.mjs";


class Piece {
    constructor(row, column) {
        this.position = [row, column];
        this.initialPosition = [row, column];
        this.lastPosition = [row, column];
        this.id = crypto.randomUUID();
    }
    move(row, column) {
        let rowChange = row - this.position[0];
        let columnChange = column - this.position[1];
        if (!this.legalMovePath(rowChange, columnChange)) return false;

        if (this instanceof King && !BoardRules.kingsLegalDistance(this, row, column)) return false;

        if ((this instanceof Pawn || this instanceof Bishop || this instanceof Rook || 
            this instanceof Queen)
            && BoardRules.checkObstacules(this, row, column, rowChange, columnChange)) return false;

        if (!BoardRules.move(this, row, column)) return false;
        
        this.lastPosition = [...this.position];
        this.position = [row, column];
        return true;
    }
    capture(row, column) {
        let rowChange = row - this.position[0];
        let columnChange = column - this.position[1];
        if (!this.legalCapturePath(rowChange, columnChange)) return false;

        if (this instanceof King && !BoardRules.kingsLegalDistance(this, row, column)) return false;

        if ((this instanceof Bishop || this instanceof Rook || this instanceof Queen)
            && BoardRules.checkObstacules(this, row, column, rowChange, columnChange)) return false;

        if (this instanceof Pawn && BoardRules.enPassant(this, column)) {
            BoardRules.captureEnPassant(this, row, column);
        } else if (!BoardRules.capture(this, row, column)) return false;

        this.lastPosition = [...this.position];
        this.position = [row, column];
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

    // getPotentialCaptures() {
    //     const potentialCaptures = [];
    //     for (let i = 0; i < 8; i++) {
    //         let rowChange = i - this.position[0];

    //         for (let j = 0; j < 8; j++) {
    //             let columnChange = j - this.position[1];

    //             if (this.legalCapturePath(rowChange, columnChange)) {
    //                 let potentialMove = [i, j];
    //                 potentialCaptures.push(potentialMove);
    //             }
    //         }
    //     }
    //     return potentialCaptures;
    // }
}


class Pawn extends Piece{
    constructor(color, row, column){
        super(row, column);
        this.name = "Pawn";
        this.color = color; 
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
        } else {return false}

    }
}

class Bishop extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "Bishop";
        this.color = color;
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
    }
    legalMovePath(rowChange, columnChange) {
        if ((Math.abs(rowChange) === 1 && Math.abs(columnChange) === 1) ||
            (Math.abs(rowChange) === 1 && columnChange === 0) ||
            (rowChange === 0 && Math.abs(columnChange) === 1))  {
            return true;
        } else {return false}
    }
}
King.prototype.legalCapturePath = King.prototype.legalMovePath;

    //Definir trayectoria y checks

export { Pawn, Bishop, Knight, Rook, Queen, King }