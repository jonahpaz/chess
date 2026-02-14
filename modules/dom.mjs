import { game } from "./game-controller.mjs";
import { Rules } from "./board-interactions.mjs";
import { Console } from "./console.mjs";
import { board } from "./board.mjs";
import { dungeon } from "./dungeon.mjs";

const blockDivMap = new Map();
const squaresMap = new Map();
const piecesMap = new Map();
class DomEl {
    static getSquareDiv(square) {
        let squareDiv = document.createElement("div");
        squareDiv.classList.add("square", square.color);
        squareDiv.dataset.id = square.id;
        squareDiv.dataset.rank = square.rank;
        squareDiv.dataset.file = square.file;
        squareDiv.style.anchorName = square.piece ?
        `--${square.piece.id}` : ``;
        squaresMap.set(square.id, {object: square, element: squareDiv});
        return squareDiv;
    }
    static getPieceButton(piece) {
        const pieceButton = document.createElement("button");
        pieceButton.classList.add("piece", "on-board");
        pieceButton.dataset.id = piece.id;
        pieceButton.dataset.name = piece.name;
        pieceButton.dataset.color = piece.color;
        pieceButton.textContent = piece.name;
        pieceButton.style.positionAnchor = `--${piece.id}`;
        piecesMap.set(piece.id, {object: piece, element: pieceButton});
        return pieceButton;
    }
    static getDungeonPiece(piece) {
        const dungeonPiece = document.createElement("button");
        dungeonPiece.disabled = true;
        dungeonPiece.classList.add("piece", "captured");
        dungeonPiece.dataset.name = piece.name;
        dungeonPiece.dataset.color = piece.color;
        dungeonPiece.textContent = piece.name.slice(0,2);
        return dungeonPiece;
    }
    // static getPromotionPiece(pawn, promotion) {
    //     const pieceRadio = document.createElement("input");
    //     pieceRadio.type = "radio"; pieceRadio.id = promotion;
    //     pieceRadio.name = "promotion"; pieceRadio.value = promotion;
    //     pieceRadio.onchange = "this.form.submit()";

    //     const pieceLabel = document.createElement("label");
    //     pieceLabel.for = promotion;
    //     pieceLabel.classList.add(`${pawn.color}`, "piece", "promotion");
    //     pieceLabel.textContent = promotion;
    //     pieceLabel.appendChild(pieceRadio);
    //     return pieceLabel;
    // }
    static getBlockDiv(dungeonColor, Class) {
        const blockDiv = document.createElement("div");
        blockDiv.classList.add("block");
        blockDiv.dataset.name = Class;
        blockDiv.dataset.dungeon = dungeonColor;
        blockDivMap.set(`${dungeonColor}-dungeon-${Class}`, blockDiv);
        return blockDiv;
    }
}

class DisplayController {
    static #boardDiv = document.querySelector(".board");
    static get boardDiv() {
        return this.#boardDiv;
    }
    static #perspective = "white";
    static restart = document.querySelector("#restart");
    static variant = document.querySelector("#variant");
    static perspective = document.querySelector("#perspective");
    static whiteDungeonDiv = document.querySelector(".white.dungeon");
    static blackDungeonDiv = document.querySelector(".black.dungeon");
    static whitePointsUpDiv = document.querySelector(".white.points-up");
    static blackPointsUpDiv = document.querySelector(".black.points-up");
    static promotionDialog = document.querySelector(".promotion");
    
    static setListeners() {
        DisplayController.boardDiv.addEventListener("click", this.castleChess960.bind(DisplayController));
        DisplayController.boardDiv.addEventListener("click", this.classicalMove.bind(DisplayController));
        DisplayController.boardDiv.addEventListener("click", this.activatePieceButton.bind(DisplayController));
        DisplayController.restart.addEventListener("click", this.restartGame.bind(DisplayController));
        DisplayController.variant.addEventListener("change", this.changeVariant.bind(DisplayController))
        DisplayController.perspective.addEventListener("change", this.changePerspective.bind(DisplayController))
    }
    
    
    
    static activatePieceButton(event) {
        let pieceButton = event.target;
        if (!pieceButton.classList.contains("piece")) return false;

        if (pieceButton.dataset.color !== game.activePlayer) return false;
        
        if (!DisplayController.boardDiv.querySelector(".active")) {
            pieceButton.classList.add("active");

        } else {
            let lastActiveButton = DisplayController.boardDiv.querySelector(".active");
            if (lastActiveButton.dataset.color === pieceButton.dataset.color) {
                lastActiveButton.classList.remove("active");
                pieceButton.classList.add("active");
            }
        }
        this.updateLegalMoveHighlight();
    }
    
    static classicalMove(event) {
        let activePieceButton = DisplayController.boardDiv.querySelector(".active");
        if (!activePieceButton) return;
        if (activePieceButton.dataset.color !== game.activePlayer) return;
        
        let newPosition = event.target;
        if (newPosition.classList.contains("piece")) newPosition = newPosition.parentElement;
        let rank = +newPosition.dataset.rank;
        let file = +newPosition.dataset.file;
        
        let activePiece = piecesMap.get(activePieceButton.dataset.id).object;
        
        let moveData = {piece: activePiece, rank, file};
        let move = game.makeAMove(moveData);
        if (!move.typeOfMove) return;
        this.updateGame(move, activePieceButton, rank, file);
    }
    static castleChess960(event) {
        let rookButton = event.target;
        if (rookButton.dataset.name !== "Rook") return false;
        let rook = piecesMap.get(rookButton.dataset.id).object
        
        let kingButton = DisplayController.boardDiv.querySelector(".active");
        if (!kingButton || kingButton.dataset.name !== "King") return false;
        if (kingButton.dataset.color !== rookButton.dataset.color) return false;
        
        let kingCastleFile;
        if (+rookButton.parentElement.dataset.file > +kingButton.parentElement.dataset.file) {
            kingCastleFile = 6;
            rook.castleFile = 5;
        } else {
            kingCastleFile = 2;
            rook.castleFile = 3;
        }
        let king = piecesMap.get(kingButton.dataset.id).object;
        let data = {piece: king, rank: king.position[0], file: kingCastleFile, rook}
        let castle = game.makeAMove(data);
        if (!castle.typeOfMove) return false;
        this.updateGame(castle, kingButton, king.position[0], kingCastleFile);
    }


    static restartGame() {
        game.reset();
        piecesMap.clear(); squaresMap.clear(); blockDivMap.clear();
        DisplayController.boardDiv.innerHTML = "";
        this.setInitialBoardDiv();
        DisplayController.whiteDungeonDiv.innerHTML = "";
        DisplayController.blackDungeonDiv.innerHTML = "";
        this.setDungeonDivs();
        DisplayController.whitePointsUpDiv.textContent = "";
        DisplayController.blackPointsUpDiv.textContent = "";
        this.#perspective = "white";
        DisplayController.perspective.value = "white";
    }
    static changeVariant(event) {
        let variant = event.target.value;
        if (variant === board.variant) return;
        board.variant = variant;
        this.restartGame();
    }
    static changePerspective(event) {
        let perspective = event.target.value;
        if (perspective === this.#perspective) return;        
        this.#perspective = perspective;
        for (let i = 0; i < 4; i++) {        
                for (let j = 0; j < 8; j++) {
                    let upperRank = DisplayController.boardDiv.children[i];
                    let lowerRank = DisplayController.boardDiv.children[7 - i];
                    lowerRank.insertBefore(upperRank.firstElementChild, lowerRank.firstElementChild);
                    upperRank.appendChild(lowerRank.lastElementChild);
                }
        }
    }
    
    static updateGame(move, activePieceButton, rank, file) {
        activePieceButton.classList.remove("active");
        this.updateDungeonDivs();
        this.updatePointsUpDivs(); this.updateLegalMoveHighlight();
        this.updateKingSaviorsHighlight(move.kingSaviors);
        this.updateBoardDiv(move.capturedPiece, move.promotion);
        if (move.checkMate) this.gameOver();
    }
    static gameOver() {
        let pieceButtons = DisplayController.boardDiv.querySelectorAll(".piece");
        for (const button of pieceButtons) {
            button.disabled = true;
        }
    }

    static updateBoardDiv(capturedPiece, promotion) {
        let promotionRank, promotionFile, promotionButton, pawnButton;
        if (promotion) {
            promotionRank = promotion.piece.position[0];
            promotionFile = promotion.piece.position[1];
            promotionButton = DomEl.getPieceButton(promotion.piece);
            pawnButton = piecesMap.get(promotion.pawn.id).element;                
            pawnButton.parentElement.style.anchorName = `${promotion.pawn.id}`
        }
        let capturedButton;
        if (capturedPiece) {
            capturedButton = piecesMap.get(capturedPiece.id).element;
            capturedButton.style.zIndex = "0";
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let squareDiv = squaresMap.get(board.body[i][j].id).element;
                let previousPieceButton = squareDiv.children[0];
                
                let piece = board.body[i][j].piece; 
                let currentPieceButton = piece ? piecesMap.get(piece.id).element : undefined;
                if (previousPieceButton === currentPieceButton) continue;
                
                if (promotion && i === promotionRank && j === promotionFile)
                    {currentPieceButton = promotionButton}
                
                if (piece) {squareDiv.style.anchorName = `--${piece.id}`}
                else {squareDiv.style.anchorName = ``}
                setTimeout(() => {
                    if (currentPieceButton) squareDiv.appendChild(currentPieceButton);
                }, 180);
            }
        }
        setTimeout(() => {
            if (pawnButton) pawnButton.remove();
            if (capturedPiece) capturedButton.remove();
        }, 180);
    }
    
    static setInitialBoardDiv() {
        for (let i = 0; i < 8; i++) {
            let rankDiv = document.createElement("div");
            rankDiv.classList.add("rank");

            for (let j = 0; j < 8; j++) {
                let square = board.body[i][j];
                let piece = board.body[i][j].piece;

                let squareDiv = DomEl.getSquareDiv(square);
                if (piece) {
                    let pieceButton = DomEl.getPieceButton(piece);
                    squareDiv.appendChild(pieceButton);
                }
                rankDiv.appendChild(squareDiv);
            }
            DisplayController.boardDiv.appendChild(rankDiv);
        }
    }


    static updateDungeonDivs() {
        function updateDungeonDiv(dungeonColor, dungeon) {
            for (const [Class, block] of dungeon) {
                let piecesInBlock = block.length;
                let blockDiv = blockDivMap.get(`${dungeonColor}-dungeon-${Class}`);
                let piecesInBlockDiv = blockDiv.children.length;
    
                let difference = piecesInBlock - piecesInBlockDiv;
                if (difference === 0) continue;
                if (difference > 0) {
                    let anyPieceInBlock = block[0];
                    let dungeonPiece = DomEl.getDungeonPiece(anyPieceInBlock);
                    blockDiv.appendChild(dungeonPiece);
                    continue;
                }
                if (difference < 0) {
                    blockDiv.children[0].remove();
                }
            }
        }
        updateDungeonDiv("white", dungeon.white);
        updateDungeonDiv("black", dungeon.black);
    }
    static setDungeonDivs() {
        blockDivMap.clear();
        function setDungeonDiv(dungeonColor, dungeon, dungeonDiv) {
            dungeonDiv.innerHTML = "";
            for (const [Class, piece] of dungeon) {
                let blockDiv = DomEl.getBlockDiv(dungeonColor, Class);
                dungeonDiv.appendChild(blockDiv);
            }
        }
        setDungeonDiv("white", dungeon.white, DisplayController.whiteDungeonDiv);
        setDungeonDiv("black", dungeon.black, DisplayController.blackDungeonDiv);
    }
    static updatePointsUpDivs() {
        DisplayController.whitePointsUpDiv.textContent = "";
        DisplayController.blackPointsUpDiv.textContent = "";
        let whitePointsUp = board.points.white - board.points.black;
        let blackPointsUp = board.points.black - board.points.white;
        if (whitePointsUp > 0) DisplayController.whitePointsUpDiv.textContent = `+${whitePointsUp}`;
        if (blackPointsUp > 0) DisplayController.blackPointsUpDiv.textContent = `+${blackPointsUp}`;
    }
    
    static updateLegalMoveHighlight() {
        for (const square of squaresMap.values()) {
            square.element.classList.remove("legal-move");
        }
        let activeButton = DisplayController.boardDiv.querySelector(".active");
        if (activeButton) {
            let activePiece = piecesMap.get(activeButton.dataset.id).object;
            let positions = Rules.getEveryLegalMove(board.body, activePiece);
            positions.forEach(
                position => {
                    let rank = position[0];
                    let file = position[1];
                    let square = board.body[rank][file];
                    let squareDiv = squaresMap.get(square.id).element;
                    squareDiv.classList.add("legal-move");
                }
            );
        }
    }
    static updateKingSaviorsHighlight(kingSaviorsArr) {
        for (const piece of piecesMap.values()) {
            piece.element.classList.remove("king-savior");
        }
        if (kingSaviorsArr && kingSaviorsArr.length > 0) {
            for (const kingSavior of kingSaviorsArr) {
                let kingSaviorButton = piecesMap.get(kingSavior.id).element;
                kingSaviorButton.classList.add("king-savior");
            }
        }
    }
    // static promotion(pawn, rank, file) {
    //     let promotionDialog = DisplayController.promotionDialog;
    //     promotionDialog.add.classList(`${this.#perspective}-perspecctive`, `${pawn.color}`);
    //     promotionDialog.style.zIndex = 2;
    //     let form = document.createElement("form");
    //     form.method = "dialog";
    //     promotionDialog.appendChild(form);

    //     let queen = DomEl.getPromotionPiece(pawn, "Queen");
    //     let rook = DomEl.getPromotionPiece(pawn, "Rook");
    //     let bishop = DomEl.getPromotionPiece(pawn, "Bishop");
    //     let knight = DomEl.getPromotionPiece(pawn, "Knight");
    //     form.appendChild(queen); form.appendChild(rook);
    //     form.appendChild(bishop); form.appendChild(knight);
    //     let anchorPosition = DisplayController.boardDiv.querySelector(`.square[data-rank="${rank}"][data-file="${file}"]`).dataset.anchorName;
    //     promotionDialog.style.anchorPosition = anchorPosition;

    //     promotionDialog.showModal();

    //     return form.value;
    // }
}

DisplayController.setInitialBoardDiv();
DisplayController.setListeners();
DisplayController.setDungeonDivs();

Console.log({board: board.body, dungeon, activePlayer: game.activePlayer})