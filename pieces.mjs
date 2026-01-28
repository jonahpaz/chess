class Piece {
    constructor(row, column) {
        this.initialPosition = [row, column];
        this.position = this.initialPosition;
        this.lastPosition = this.initialPosition;
        this.id = crypto.randomUUID();
    }

    move(row, column) { 
        let displacement = this.getDisplacement(row, column);
        if (this instanceof King) {
            if (this.legalCastleDisplacement(...displacement)) return "castle";
        }
        if (!this.legalMoveDisplacement(...displacement)) return false;
        return "move";
    }
    capture(row, column) { 
        let displacement = this.getDisplacement(row, column);
        if (!this.legalCaptureDisplacement(...displacement)) return false;
        return "capture";
    }

    getDisplacement(row, column) {
        let rowChange = row - this.position[0];
        let columnChange = column - this.position[1];
        return [rowChange, columnChange];
    }
    // getHypotheticalMovesAndCaptures() {
    //     const hypotheticalMovesAndCaptures = [];
    //     for (let i = 0; i < 8; i++) {
    //         let rowChange = i - this.position[0];

    //         for (let j = 0; j < 8; j++) {
    //             let columnChange = j - this.position[1];

    //             if (this.legalMoveDisplacement(rowChange, columnChange) || 
    //                 this.legalCaptureDisplacement(rowChange, columnChange)) {
    //                 let potentialMove = [i, j];
    //                 hypotheticalMovesAndCaptures.push(potentialMove);
    //             }
    //         }
    //     }
    //     return hypotheticalMovesAndCaptures;
    // }
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
    legalEnPassantPosition() { //quiza sirva para acotar mas el total de operaciones y lo pones en Piece en capture antes del return despues del legalCaptureDisplacement
        if (this.color === "white" && this.position[0] !== 3) return false;
        if (this.color === "black" && this.position[0] !== 4) return false;
        return "enPassant";
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
        this.value = 3;
        kingsMap.set(this.color, this);
    }
    legalMoveDisplacement(rowChange, columnChange){
        if ((Math.abs(rowChange) === 1 && Math.abs(columnChange) === 1) ||
            (Math.abs(rowChange) === 1 && columnChange === 0) ||
            (rowChange === 0 && Math.abs(columnChange) === 1))  {
            return true;
        } else {return false}
    }
    legalCastleDisplacement(rowChange, columnChange) {
        if (rowChange === 0 && Math.abs(columnChange) === 2 //Para Chess-960 Modify Math.abs(columnChange) === 2 to Math.abs(columnChange) > 1 
            && this.initialPosition === this.position) {
            return true;
        } else {return false}
    }
    getPassingColumns(targetColumn) {
        let passingColumns = [];
        if (targetColumn - this.position[1] > 0) { 
            for (let i = this.position[1] + 1; i < targetColumn; i++) {
                passingColumns.push(i);
            }
        } else { 
            for (let i = this.position[1] - 1; i > targetColumn; i--) {
                passingColumns.push(i);
            }
        }
        return passingColumns;
    }
    getRookForCastle(targetColumn) {
        let rook;
        if (targetColumn - this.initialPosition[1] > 0) {
            for (let i = this.position[1] + 1; i < 8; i++) {
                if (rooksMap.get(`${i}-${this.color}`)) {
                    rook = rooksMap.get(`${i}-${this.color}`);
                    rook.castleColumn = targetColumn - 1;
                    return rook;
                }
            }
        } else {
            for (let i = this.initialPosition[1] - 1; i >= 0; i--) {
                if (rooksMap.get(`${i}-${this.color}`)) {
                    rook = rooksMap.get(`${i}-${this.color}`);
                    rook.castleColumn = targetColumn + 1;
                    return rook;
                }
            }
        }
    }
}
King.prototype.legalCaptureDisplacement = King.prototype.legalMoveDisplacement;

export { Piece, Pawn, Bishop, Knight, Rook, Queen, King, kingsMap, rooksMap }