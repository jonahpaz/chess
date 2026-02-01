const piecesMap = new Map();

class Piece {
    constructor(rank, file) {
        this.initialPosition = [rank, file];
        this.position = this.initialPosition;
        this.lastPosition = this.initialPosition;
        this.id = crypto.randomUUID();
        piecesMap.set(this.id, {piece: this, positions: [this.initialPosition]});
    }

    move(rank, file) { 
        let displacement = this.getDisplacement(rank, file);
        if (displacement[0] === 0 && displacement[1] === 0) return false;
        if (this instanceof King) {
            if (this.legalCastleDisplacement(...displacement)) return "castle";
        }
        if (!this.legalMoveDisplacement(...displacement)) return false;
        return "move";
    }
    capture(rank, file) { 
        let displacement = this.getDisplacement(rank, file);
        if (displacement[0] === 0 && displacement[1] === 0) return false;
        if (!this.legalCaptureDisplacement(...displacement)) return false;
        return "capture";
    }

    getDisplacement(rank, file) {
        let rankChange = rank - this.position[0];
        let fileChange = file - this.position[1];
        return [rankChange, fileChange];
    }
    update(rank, file) {
        this.lastPosition = [...this.position];
        this.position = [rank, file];
        piecesMap.get(this.id).positions.push(this.position);
    }
    getEveryPotentialDisplacement() {
        let everyPotentialDisplacement = [];
        let potentialDisplacement, rankChange, fileChange;

        for (let i = 0; i < 8; i++) {
            rankChange = i - this.position[0];
            for (let j = 0; j < 8; j++) {
                fileChange = i - this.position[1];

                if ( this.legalMoveDisplacement(rankChange, fileChange) || 
                     this.legalCaptureDisplacement(rankChange, fileChange) ||
                    (this instanceof King && 
                        this.legalCastleDisplacement(rankChange, fileChange)) ) {

                    potentialDisplacement = [i, j];
                    everyPotentialDisplacement.push(potentialDisplacement);
                }
            }
        }
        return everyPotentialDisplacement;
    }
}


class Pawn extends Piece{
    constructor(color, rank, file){
        super(rank, file);
        this.name = "Pawn";
        this.color = color;
        this.value = 1; 
    }
    legalMoveDisplacement(rankChange, fileChange) {
        if (rankChange > 0 && this.color === "white") {return false}
        if (rankChange < 0 && this.color === "black") {return false}
        if (fileChange === 0) {
            if (Math.abs(rankChange) === 1) {
                return true;
            } else if (Math.abs(rankChange) === 2 
                       && this.initialPosition[0] === this.position[0]) {  
                return true;
            }
        } else {return false}
    }
    legalCaptureDisplacement(rankChange, fileChange) {
        if (rankChange > 0 && this.color === "white") {return false}
        if (rankChange < 0 && this.color === "black") {return false}
        if (Math.abs(fileChange) === 1 && Math.abs(rankChange) === 1) {
            return true;
        } else {return false}
    }
}

class Bishop extends Piece {
    constructor(color, rank, file) {
        super(rank, file);
        this.name = "Bishop";
        this.color = color;
        this.value = 3;
    }
    legalMoveDisplacement(rankChange, fileChange) {
        if (Math.abs(rankChange) === Math.abs(fileChange)) {
            return true;
        } else {return false}
    }
}
Bishop.prototype.legalCaptureDisplacement = Bishop.prototype.legalMoveDisplacement;

class Knight extends Piece {
    constructor(color, rank, file) {
        super(rank, file);
        this.name = "Knight";
        this.color = color;
        this.value = 3;
    }
    legalMoveDisplacement(rankChange, fileChange) {
        if ((Math.abs(rankChange) === 1 && Math.abs(fileChange) === 2) ||
            (Math.abs(rankChange) === 2 && Math.abs(fileChange) === 1)) {
            return true;
        } else {return false}
    }
}
Knight.prototype.legalCaptureDisplacement = Knight.prototype.legalMoveDisplacement;

const rooksMap = new Map();
class Rook extends Piece {
    constructor(color, rank, file) {
        super(rank, file);
        this.name = "Rook";
        this.color = color;
        this.value = 5;
        rooksMap.set(`${this.initialPosition[1]}-${this.color}`, this);
    }
    legalMoveDisplacement(rankChange, fileChange) {
        if ((Math.abs(rankChange) > 0 && fileChange === 0) ||
            (rankChange === 0 && Math.abs(fileChange) > 0)) {
            return true;
        } else {return false}
    }
}
Rook.prototype.legalCaptureDisplacement = Rook.prototype.legalMoveDisplacement;

class Queen extends Piece {
    constructor(color, rank, file) {
        super(rank, file);
        this.name = "Queen";
        this.color = color;
        this.value = 9;
    }
    legalMoveDisplacement(rankChange, fileChange) {
        if ((Math.abs(rankChange) > 0 && fileChange === 0) ||
            (rankChange === 0 && Math.abs(fileChange) > 0) ||
            (Math.abs(rankChange) === Math.abs(fileChange))) {
            return true;
        } else {return false}
    }
}
Queen.prototype.legalCaptureDisplacement = Queen.prototype.legalMoveDisplacement;


const kingsMap = new Map();
class King extends Piece {
    constructor(color, rank, file) {
        super(rank, file);
        this.name = "King";
        this.color = color;
        this.value = 100;
        kingsMap.set(this.color, this);
    }
    legalMoveDisplacement(rankChange, fileChange){
        if ((Math.abs(rankChange) === 1 && Math.abs(fileChange) === 1) ||
            (Math.abs(rankChange) === 1 && fileChange === 0) ||
            (rankChange === 0 && Math.abs(fileChange) === 1))  {
            return true;
        } else {return false}
    }
    legalCastleDisplacement(rankChange, fileChange) {//Didn't set fixed positions for the rooks for future Chess-960
        if (rankChange === 0 && Math.abs(fileChange) === 2 //For Chess-960 modify Math.abs(fileChange) === 2 to Math.abs(fileChange) > 1 
            && this.initialPosition === this.position) {
            return true;
        } else {return false}
    }
    getPassingFiles(targetFile) {
        let passingFiles = [];
        if (targetFile - this.position[1] > 0) { 
            for (let i = this.position[1] + 1; i < targetFile; i++) {
                passingFiles.push(i);
            }
        } else { 
            for (let i = this.position[1] - 1; i > targetFile; i--) {
                passingFiles.push(i);
            }
        }
        return passingFiles;
    }
    getRookForCastle(targetFile) {//Didn't set fixed positions for the rooks for future Chess-960
        let rook;
        if (targetFile - this.initialPosition[1] > 0) {
            for (let i = this.position[1] + 1; i < 8; i++) {
                if (rooksMap.get(`${i}-${this.color}`)) {
                    rook = rooksMap.get(`${i}-${this.color}`);
                    rook.castleFile = targetFile - 1;
                    return rook;
                }
            }
        } else {
            for (let i = this.initialPosition[1] - 1; i >= 0; i--) {
                if (rooksMap.get(`${i}-${this.color}`)) {
                    rook = rooksMap.get(`${i}-${this.color}`);
                    rook.castleFile = targetFile + 1;
                    return rook;
                }
            }
        }
    }
}
King.prototype.legalCaptureDisplacement = King.prototype.legalMoveDisplacement;

export { Piece, Pawn, Bishop, Knight, Rook, Queen, King, piecesMap, kingsMap }