class Piece {
    constructor(row, column) {
        this.initialPosition = [row, column];
        this.position = this.initialPosition;
        this.lastPosition = this.initialPosition;
        this.id = crypto.randomUUID();
    }

    move(row, column) { 
        let rowChange = this.getDisplacement(this, row, column)[0];
        let columnChange = this.getDisplacement(this, row, column)[1];
        if (!this.legalMoveDisplacement(rowChange, columnChange)) return false;
        return true;
    }
    capture(row, column) { 
        let rowChange = this.getDisplacement(this, row, column)[0];
        let columnChange = this.getDisplacement(this, row, column)[1];
        if (!this.legalCaptureDisplacement(rowChange, columnChange)) return false;
        return true;
    }

    getDisplacement(piece, row, column) {
        let rowChange = row - piece.position[0];
        let columnChange = column - piece.position[1];
        return [rowChange, columnChange];
    }
    getHypotheticalMovesAndCaptures() {
        const hypotheticalMovesAndCaptures = [];
        for (let i = 0; i < 8; i++) {
            let rowChange = i - this.position[0];

            for (let j = 0; j < 8; j++) {
                let columnChange = j - this.position[1];

                if (this.legalMoveDisplacement(rowChange, columnChange) || 
                    this.legalCaptureDisplacement(rowChange, columnChange)) {
                    let potentialMove = [i, j];
                    hypotheticalMovesAndCaptures.push(potentialMove);
                }
            }
        }
        return hypotheticalMovesAndCaptures;
    }
}


class Pawn extends Piece{
    constructor(color, row, column){
        super(row, column);
        this.name = "Pawn";
        this.color = color; 
    }
    legalMoveDisplacement(rowChange, columnChange) {
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
    legalCaptureDisplacement(rowChange, columnChange) {
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
    legalMoveDisplacement(rowChange, columnChange) {
        if (Math.abs(rowChange) === Math.abs(columnChange)) {
            return true;
        } else {return false}
    }
}
Bishop.prototype.legalCaptureDisplacement = Bishop.prototype.legalMoveDisplacement;

class Knight extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "Knight";
        this.color = color;
    }
    legalMoveDisplacement(rowChange, columnChange) {
        if ((Math.abs(rowChange) === 1 && Math.abs(columnChange) === 2) ||
            (Math.abs(rowChange) === 2 && Math.abs(columnChange) === 1)) {
            return true;
        } else {return false}
    }
}
Knight.prototype.legalCaptureDisplacement = Knight.prototype.legalMoveDisplacement;

const rooksMap = new Map();
class Rook extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "Rook";
        this.color = color;
        rooksMap.set(`${this.initialPosition[1]}-${this.color}`, this);
    }
    legalMoveDisplacement(rowChange, columnChange) {
        if ((Math.abs(rowChange) > 0 && columnChange === 0) ||
            (rowChange === 0 && Math.abs(columnChange) > 0)) {
            return true;
        } else {return false}
    }
}
Rook.prototype.legalCaptureDisplacement = Rook.prototype.legalMoveDisplacement;

class Queen extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "Queen";
        this.color = color;
    }
    legalMoveDisplacement(rowChange, columnChange) {
        if ((Math.abs(rowChange) > 0 && columnChange === 0) ||
            (rowChange === 0 && Math.abs(columnChange) > 0) ||
            (Math.abs(rowChange) === Math.abs(columnChange))) {
            return true;
        } else {return false}
    }
}
Queen.prototype.legalCaptureDisplacement = Queen.prototype.legalMoveDisplacement;


const kingsMap = new Map();
class King extends Piece {
    constructor(color, row, column) {
        super(row, column);
        this.name = "King";
        this.color = color;
        kingsMap.set(this.color, this);
    }
    legalMoveDisplacement(rowChange, columnChange) {
        if (this.legalTypicalDisplacement(rowChange, columnChange)) {
            return true;
        } else if (rowChange === 0 && Math.abs(columnChange) === 2
                   && this.initialPosition === this.position) {
            return true;
        } else {return false}
    }
    legalTypicalDisplacement(rowChange, columnChange){
        if ((Math.abs(rowChange) === 1 && Math.abs(columnChange) === 1) ||
            (Math.abs(rowChange) === 1 && columnChange === 0) ||
            (rowChange === 0 && Math.abs(columnChange) === 1))  {
            return true;
        } else {return false}
    }
}
King.prototype.legalCaptureDisplacement = King.prototype.legalTypicalDisplacement;

export { Piece, Pawn, Bishop, Knight, Rook, Queen, King, kingsMap, rooksMap }