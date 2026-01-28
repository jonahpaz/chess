//static selfCheckKing(board, ownKing, ownPiece, targetRow, targetColumn) {
// let lastMove = listOfMoves[listOfMoves.length - 1]; //just for the console
// if (ownKing === ownPiece) {
//     if (lastMove && lastMove.piece.color !== ownPiece.color) //just for the console
//     console.log(`selfCheckKing says: Can't put yourself in check.`);
// } 
// else {
//     if (lastMove && lastMove.piece.color !== ownPiece.color) //just for the console
//     console.log(`selfCheckKing says: \n  Can't do it. Your king would be captured on the next move.`);
// }


// static selfCheckKingByCastling(board, ownKing, ownRook, row, kingTargetColumn, rookTargetColumn) { //Only actually makes a difference if I develop Fisher-Random-Chess later on.
// let lastMove = listOfMoves[listOfMoves.length - 1]; //just for the console
// if (lastMove && lastMove.piece.color !== ownKing.color) //just for the console
// console.log(`selfCheckKingByCastling says: \n  Can't castle. Your king would be captured on the next move.`);

//    static selfCheckKingByEnPassant(board, ownKing, ownPawn, targetRow, targetColumn) {
// let lastMove = listOfMoves[listOfMoves.length - 1]; //just for the console
// if (lastMove && lastMove.piece.color !== ownPawn.color) //just for the console
// console.log(`selfCheckKingByEnPassant says: \n  Can't do en-passant. Your king would be captured on the next move.`);

// static canBeCaptured(board, piece, row, column) {
// if (lastMove && lastMove.piece.color !== piece.color)//just for the console
// console.log(`canBeCaptured says: \n After such move ${piece.color} ${piece.name} can be captured by ${anotherPiece.color} ${anotherPiece.name}`);
// if (lastMove && lastMove.piece.color === piece.color)//just for the console
// console.log(`canBeCaptured says: \n  ${piece.color} ${piece.name}  can not be captured.`);

//  static updateConsole(typeOfMove, piece, capturedPiece, row, column, board) {
//     let consoleMessage;
//     switch (typeOfMove) {
//         case "move": {
//             consoleMessage = `consoleUpdate says: \n  ${piece.color} ${piece.name}  was moved to [${row},${column}]`;
//             break;
//         }
//         case "capture": {
//             consoleMessage = `consoleUpdate says: \n  ${piece.color} ${piece.name}  captured ${capturedPiece.color} ${capturedPiece.name}  at [${row},${column}]`;
//             break;
//         }
//         case "castle": {
//             consoleMessage = `consoleUpdate says: \n  ${piece.color} ${piece.name} castled to [${row},${column}]`;
//             break;
//         }
//         case "enPassant": {
//             consoleMessage = `consoleUpdate says: \n  ${piece.color} ${piece.name}  captured en-passant ${capturedPiece.color} ${capturedPiece.name}  and landed at [${row},${column}]`;
//             break;
//         }
//     }

//     console.log("legalMove happened");
//     console.log(consoleMessage);
//     this.checkForCheckMate(board, piece);
//     Board.displayConsoleBoard();
// }