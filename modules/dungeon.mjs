import { Pawn } from "./pieces.mjs";


class Dungeon {
    constructor() {
        this.white = this.getBody();
        this.black = this.getBody();
    }
    getBody() {
        return new Map([
            ["Queen", []], ["Rook", []], ["Bishop", []], ["Knight", []], ["Pawn", []],
        ])
    }

    update(capturedPiece, promotion) {
        if (capturedPiece) {
            let dungeonColorAndClass = this.getDungeonColorAndClass(capturedPiece);
            if (this.dungeonOfCaptureIsFull(...dungeonColorAndClass)) {
                //The only explanation for the dungeon to be full is because there was a promotion
                //Which means a pawn was removed from the board; so this balances it.
                let pawn = new Pawn(capturedPiece.color, dungeonColorAndClass[0], "dungeon");
                this.add(pawn, dungeonColorAndClass[0], "Pawn");
            } else {
                this.add(capturedPiece, ...dungeonColorAndClass);
            }
        }
        if (promotion) {
            let dungeonColorAndClass = this.getDungeonColorAndClass(promotion.piece);
            if (!this.dungeonOfPromotionIsEmpty) {
                this.remove(...dungeonColorAndClass);
            }
        }
    }

    getDungeonColorAndClass(capturedPiece) {
        let dungeonColor = capturedPiece.color === "white" ? "black" : "white";
        let Class = capturedPiece.constructor.name;
        return [dungeonColor, Class];
    }
    add(capturedPiece, dungeonColor, Class) { //white dungeon holds black pieces and viceverse
        this[dungeonColor].get(Class).push(capturedPiece);
    }
    remove(dungeonColor, Class) {
        this[dungeonColor].get(Class).pop();
    }
    dungeonOfPromotionIsEmpty(dungeonColor, Class) {
        let sameClassCapturedPieces = this[dungeonColor].get(Class);
        if (sameClassCapturedPieces.length === 0) return true;
        return false;
    }
    dungeonOfCaptureIsFull(dungeonColor, Class) {
        let sameClassCapturedPieces = this[dungeonColor].get(Class);

        if ( (Class === "Rook" || Class === "Bishop" || Class === "Knight")
            && sameClassCapturedPieces.length === 2)
            {return true}
        else if (Class === "Queen" && sameClassCapturedPieces.length === 1) 
            {return true}
    
        return false;
    }

    reset() {
        for (const [Class, pieces] of this.white) {
            pieces.length = 0;
        }
        for (const [Class, pieces] of this.black) {
            pieces.length = 0;
        }
    }
}
const dungeon = new Dungeon();


export { dungeon }