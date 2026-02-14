class Console {
    static log(data) {
        if (data.move) console.log(data.move);
        let consoleBoard = this.getConsoleBoard(data.board);
        console.log(consoleBoard);
        console.log(data.dungeon);
        console.log(`
            It is ${data.activePlayer}'s turn.`);
    }
    static getConsoleBoard(board) { //Just to check on the console easily;
        let consoleBoard = [];
        board.forEach(rank => {
            let consoleRank = [];
            
            rank.forEach(square => {
                let consoleSquare = square.piece? 
                `${square.piece.color[0].toUpperCase()}-${square.piece.name.slice(0,2)}` 
                : `--${square.color[0]}-`;
                consoleRank.push(consoleSquare);
            });
            
            consoleBoard.push(consoleRank);
        });
        return consoleBoard;
    }
}

export { Console }