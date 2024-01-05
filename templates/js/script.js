var socketio = io(); // Connects to the backend Flask server, and emits a connect event.

const boardHtml = document.querySelector("#entire-board");
const body = document.querySelector("body");
let white_pov = true;
let white_move = true;
let clickedSqr = false;
let sourceSqr, destinationSqr;
let over = false;
//parameters for castling
let wQRookMoved = false,
  wKRookMoved = false,
  bKRookMoved = false,
  bQRookMoved = false;
let bKingMoved = false,
  wKingMoved = false;
let promotedPiece=0;
let castlingPossible = false;
let enPassant = -1;
let legalMoves = [];
let squares = [];
let moves = [];
let board = [
  [-5, -2, -3, -9, -7, -3, -2, -5],
  [-1, -1, -1, -1, -1, -1, -1, -1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [5, 2, 3, 9, 7, 3, 2, 5],
];
let resultDivTimeout = 10;  // Result div timeout in seconds
let resultDivTimeoutPtr;
const white_promotion=document.getElementById("white-promotion");
const black_promotion=document.getElementById("black-promotion");
const promoPieces=document.getElementsByClassName("promo-piece");

function resetGlobalVars(){
  white_pov = true;
  white_move = true;
  clickedSqr = false;
  over = false;
  //parameters for castling
  wQRookMoved = false; wKRookMoved = false; bKRookMoved = false; bQRookMoved = false;
  bKingMoved = false; wKingMoved = false;
  castlingPossible = false;
  enPassant = -1;
  legalMoves = [];
  squares = [];
  moves = [];
  board = [
    [-5, -2, -3, -9, -7, -3, -2, -5],
    [-1, -1, -1, -1, -1, -1, -1, -1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [5, 2, 3, 9, 7, 3, 2, 5],
  ];
  clearTimeout(resultDivTimeoutPtr);
  let resultDiv = document.getElementById("result-div");
  if(resultDiv) resultDiv.remove();
}
//function that takes piece value as input and returns its name corresponding to its png

function intToPngName(piece) {
  let name;
  if (piece < 0) {
    name = "b";
    name = name + (0 - piece);
  } else if (piece > 0) {
    name = "w";
    name = name + piece;
  }
  return name;
}

function createBoard() {
  resetGlobalVars();
  //making board and storing references in squares 2d array
  for (let i = 0; i < 8; i++) {
    let row = [];
    for (let j = 0; j < 8; j++) {
      row.push(document.createElement("div"));
      if ((i + j) % 2 === 0) {
        row[j].classList.add("white");
      } else {
        row[j].classList.add("black");
      }
      boardHtml.appendChild(row[j]);
    }
    squares.push(row);
  }
  //adding pieces
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      squares[i][j].addEventListener("click", sqrClickedListener);
      if (board[i][j]) {
        addImgToSqr(squares[i][j], board[i][j]);
      }
    }
  }

  // For black, rotate POV.
  if (color === "Black") {
    white_pov = false;
    black_pov();
  }
}

//function that takes a square(div) as input and returns position in the board (int)
function findSqr(div_ref) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (squares[i][j] === div_ref) return [i, j];
    }
  }
}

let pathToStaticFolder = `{{url_for('static', filename='')}}`;
function addImgToSqr(square, piece) {
  console.log(piece);
  let img = document.createElement("img");
  img.classList.add("piece");
  img.src = `${pathToStaticFolder}${intToPngName(piece)}.png`;
  square.appendChild(img);
}

function black_pov() {
  //if black pov
  if (!white_pov) {
    document.querySelector(".board").style.rotate = "180deg";
    for (let i in squares) {
      for (let j in squares) {
        squares[i][j].style.rotate = "180deg";
      }
    }
  }
}

function isLegal(destSqr) {
  for (let i = 0; i < legalMoves.length; i++) {
    if (legalMoves[i][0] === destSqr[0] && legalMoves[i][1] === destSqr[1])
      return true;
  }
  return false;
}

for(let i=0;i<promoPieces.length;i++){
  promoPieces[i].addEventListener("click",()=>{
    promotedPiece=promoPieces[i].dataset.value;
  })
}

function takePromotedPieceInput(){
  return new Promise(function(resolve,reject){
    let interval=setInterval(()=>{
      if(promotedPiece) {
        clearInterval(interval);
        resolve(promotedPiece);
      }
    });
  });
}

//function when a square is clicked
async function sqrClickedListener() {
  if (clickedSqr) {
    destinationSqr = findSqr(this);
    if (isLegal(destinationSqr)) {
      if(board[sourceSqr[0]][sourceSqr[1]]===1||board[sourceSqr[0]][sourceSqr[1]]===-1){
        if(white_move) white_promotion.classList.toggle("invisible");
        else black_promotion.classList.toggle("invisible");
        if(destinationSqr[0]===0||destinationSqr[0]===7){
          promotedPiece=+await takePromotedPieceInput();
          console.log("promoted "+promotedPiece);
        }
        if(white_move) white_promotion.classList.toggle("invisible");
        else black_promotion.classList.toggle("invisible");
      }
      movePiece(sourceSqr, destinationSqr,promotedPiece);
      //updating moves
      moves.push([sourceSqr, destinationSqr]);
      //give the chance to other player
      //send your move to the server
      socketio.emit("game", {
        data: "",
        source: sourceSqr,
        destination: destinationSqr,
        promotedPiece ,
      });
      white_move = !white_move;
      if (isGameOver()) gameOver();
    }
    squares[sourceSqr[0]][sourceSqr[1]].classList.remove("pieceSelected");
    destinationSqr = [-1, -1];
    sourceSqr = [-1, -1];
    //clearing hightlighted squares
    highlightSqrs(false);
    clickedSqr = false;
  } else {
    sourceSqr = findSqr(this);
    if (
      (board[sourceSqr[0]][sourceSqr[1]] > 0 && white_move && white_pov) ||
      (board[sourceSqr[0]][sourceSqr[1]] < 0 && !white_move && !white_pov)
    ) {
      castlingPossible = false;
      enPassant = -1;
      promotedPiece=0;
      clickedSqr = true;
      legalMoves = legalMovesFinder(
        sourceSqr,
        board[sourceSqr[0]][sourceSqr[1]],
      );
      squares[sourceSqr[0]][sourceSqr[1]].classList.add("pieceSelected");
      highlightSqrs(true);
    } else {
      sourceSqr = [-1, -1];
      clickedSqr = false;
    }
  }
}

function highlightSqrs() {
  for (let i = 0; i < legalMoves.length; i++) {
    squares[legalMoves[i][0]][legalMoves[i][1]].classList.toggle("selected");
  }
}

function isWhiteInCheck(white) {
  //if white is true,check if white king is in check and return true if it is indeed in check
  //if white is false,check if black king is in check
  let r, c;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if ((white && board[i][j] === 7) || (!white && board[i][j] === -7)) {
        r = i;
        c = j;
      }
    }
  }
  let attackingPieces = [1, 2, 3, 5, 9, 7];
  for (let i = 0; i < 6; i++) {
    let attackingSpots = movesFinder(
      [r, c],
      white ? attackingPieces[i] : 0 - attackingPieces[i],
    );
    for (let j = 0; j < attackingSpots.length; j++) {
      if (
        board[attackingSpots[j][0]][attackingSpots[j][1]] ===
        (!white ? attackingPieces[i] : 0 - attackingPieces[i])
      ) {
        return true;
      }
    }
  }
  return false;
}

//returns all posibble ways a piece can go to irrespective of legal or not
function movesFinder(position, piece) {
  let possibleMoves = [];
  //possible moves if it is a pawn
  if (piece === 1 || piece === -1) {
    //if white, row-- or if black,row++
    let r = position[0] - piece,
      c = position[1];
    //if there is no piece in front, you can go there
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && !board[r][c])
      possibleMoves.push([r, c]);
    //if diagonally, there is an opponents piece, you can take it
    if (
      c - 1 >= 0 &&
      ((board[r][c - 1] < 0 && piece > 0) || (board[r][c - 1] > 0 && piece < 0))
    ) {
      possibleMoves.push([r, c - 1]);
    }
    if (
      c + 1 < 8 &&
      ((board[r][c + 1] < 0 && piece > 0) || (board[r][c + 1] > 0 && piece < 0))
    ) {
      possibleMoves.push([r, c + 1]);
    }
    //if pawn is on 2nd rank or 7th rank, you can have 2 moves
    if (
      (!white_move && position[0] === 1) ||
      (white_move && position[0] === 6)
    ) {
      r = position[0] - 2 * piece;
      c = position[1];
      if (!board[r][c] && !board[r + piece][c]) possibleMoves.push([r, c]);
    }
    //and the most important move.. en passant
    r = position[0];
    c = position[1];
    let nmoves = moves.length;
    //if latest move is made by a pawn, and the pawn has made 2 moves for its first move and the pawn is adjacent to the selected pawn, en passant is possible
    if (white_move && nmoves > 0 && r === 3) {
      if (board[moves[nmoves - 1][1][0]][moves[nmoves - 1][1][1]] === -1) {
        if (moves[nmoves - 1][1][0] - moves[nmoves - 1][0][0] === 2) {
          let t = moves[nmoves - 1][1][1];
          t -= c;
          if (t === 1 || t === -1) {
            possibleMoves.push([r - 1, c + t]);
            enPassant = c + t;
          }
        }
      }
    }
    if (!white_move && r === 4) {
      if (board[moves[nmoves - 1][1][0]][moves[nmoves - 1][1][1]] === 1) {
        if (moves[nmoves - 1][1][0] - moves[nmoves - 1][0][0] === -2) {
          let t = moves[nmoves - 1][1][1];
          t -= c;
          if (t === 1 || t === -1) {
            possibleMoves.push([r + 1, c + t]);
            enPassant = c + t;
          }
        }
      }
    }
  }
  //possible moves if it is a rook (or a queen)
  if (piece === 5 || piece === -5 || piece === 9 || piece === -9) {
    let r = position[0],
      c = position[1];
    //going right
    while (true) {
      c++;
      if (c > 7) break;
      //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
      if ((board[r][c] > 0 && piece > 0) || (board[r][c] < 0 && piece < 0))
        break;
      possibleMoves.push([r, c]);
      if (board[r][c]) break;
    }
    //going left
    c = position[1];
    while (true) {
      c--;
      if (c < 0) break;
      //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
      if ((board[r][c] > 0 && piece > 0) || (board[r][c] < 0 && piece < 0))
        break;
      possibleMoves.push([r, c]);
      if (board[r][c]) break;
    }
    //going down
    c = position[1];
    while (true) {
      r++;
      if (r > 7) break;
      if ((board[r][c] > 0 && piece > 0) || (board[r][c] < 0 && piece < 0))
        break;
      possibleMoves.push([r, c]);
      if (board[r][c]) break;
    }
    //going down
    r = position[0];
    while (true) {
      r--;
      if (r < 0) break;
      if ((board[r][c] > 0 && piece > 0) || (board[r][c] < 0 && piece < 0))
        break;
      possibleMoves.push([r, c]);
      if (board[r][c]) break;
    }
  }
  //possible moves if it is a bishop (or a queen)
  if (piece === 3 || piece === -3 || piece === 9 || piece === -9) {
    let r = position[0],
      c = position[1];
    //going up-right
    while (true) {
      c++;
      r--;
      if (c > 7 || r < 0) break;
      //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
      if ((board[r][c] > 0 && piece > 0) || (board[r][c] < 0 && piece < 0))
        break;
      possibleMoves.push([r, c]);
      if (board[r][c]) break;
    }
    //going down-right
    r = position[0];
    c = position[1];
    while (true) {
      c++;
      r++;
      if (c > 7 || r > 7) break;
      //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
      if ((board[r][c] > 0 && piece > 0) || (board[r][c] < 0 && piece < 0))
        break;
      possibleMoves.push([r, c]);
      if (board[r][c]) break;
    }
    //going up-left
    r = position[0];
    c = position[1];
    while (true) {
      c--;
      r--;
      if (c < 0 || r < 0) break;
      //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
      if ((board[r][c] > 0 && piece > 0) || (board[r][c] < 0 && piece < 0))
        break;
      possibleMoves.push([r, c]);
      if (board[r][c]) break;
    }
    //going down-left
    r = position[0];
    c = position[1];
    while (true) {
      c--;
      r++;
      if (r > 7 || c < 0) break;
      //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
      if ((board[r][c] > 0 && piece > 0) || (board[r][c] < 0 && piece < 0))
        break;
      possibleMoves.push([r, c]);
      if (board[r][c]) break;
    }
  }
  //possible moves if its a knight
  if (piece === 2 || piece === -2) {
    let r = position[0],
      c = position[1];
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (i && j && i !== j && i !== 0 - j) {
          if (r + i >= 0 && r + i < 8 && c + j >= 0 && c + j < 8) {
            if (
              (board[r + i][c + j] <= 0 && piece > 0) ||
              (board[r + i][c + j] >= 0 && piece < 0)
            )
              possibleMoves.push([r + i, c + j]);
          }
        }
      }
    }
  }
  //possible moves if its a king
  if (piece === 7 || piece === -7) {
    let r = position[0],
      c = position[1];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        //if at least i or j are non zeroes, then king can go there
        if ((i || j) && r + i >= 0 && r + i < 8 && c + j >= 0 && c + j < 8) {
          if (
            (board[r + i][c + j] >= 0 && piece < 0) ||
            (board[r + i][c + j] <= 0 && piece > 0)
          ) {
            possibleMoves.push([r + i, c + j]);
          }
        }
      }
    }
    //if the possibleMoves contains a negative , then it is castling
    if (
      (piece > 0 &&
        !wKingMoved &&
        !wKRookMoved &&
        !board[r][c + 1] &&
        !board[r][c + 2]) ||
      (piece < 0 &&
        !bKingMoved &&
        !bKRookMoved &&
        !board[r][c + 1] &&
        !board[r][c + 2])
    ) {
      possibleMoves.push([r, c + 2]);
      castlingPossible = true;
    }
    if (
      (piece > 0 &&
        !wKingMoved &&
        !wQRookMoved &&
        !board[r][c - 1] &&
        !board[r][c - 2] &&
        !board[r][c - 3]) ||
      (piece < 0 &&
        !bKingMoved &&
        !bQRookMoved &&
        !board[r][c - 1] &&
        !board[r][c - 2] &&
        !board[r][c - 3])
    ) {
      possibleMoves.push([r, c - 2]);
      castlingPossible = true;
    }
  }
  return possibleMoves;
}

function legalMovesFinder(position, piece) {
  let allPossibleMoves = movesFinder(position, piece);
  let allLegalMoves = [];
  for (let i = 0; i < allPossibleMoves.length; i++) {
    //make the move
    let t = board[allPossibleMoves[i][0]][allPossibleMoves[i][1]];
    board[allPossibleMoves[i][0]][allPossibleMoves[i][1]] =
      board[position[0]][position[1]];
    board[position[0]][position[1]] = 0;
    //if your king in check, don't add it to legalMoves
    //if your king is not in check, add it
    if (
      (white_move && !isWhiteInCheck(true)) ||
      (!white_move && !isWhiteInCheck(false))
    )
      allLegalMoves.push(allPossibleMoves[i]);
    //redo the move
    board[position[0]][position[1]] =
      board[allPossibleMoves[i][0]][allPossibleMoves[i][1]];
    board[allPossibleMoves[i][0]][allPossibleMoves[i][1]] = t;
  }
  return allLegalMoves;
}

function isGameOver() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if ((white_move && board[i][j] > 0) || (!white_move && board[i][j] < 0)) {
        if (legalMovesFinder([i, j], board[i][j]).length !== 0) return false;
      }
    }
  }
  return true;
}

function gameOver() {
  over = true;
  let result, whoWon;
  if (white_move && isWhiteInCheck(true)) {
    result = "Checkmate, Black wins!";
    whoWon = "Black";
  } else if (!white_move && isWhiteInCheck(false)) {
    result = "Checkmate, White wins!";
    whoWon = "White";
  } else {
    result = "Stalemate";
    whoWon = "Draw";
  }

  socketio.emit("gameOver", {
    outcome: result,
    whoWon: whoWon,
  });

  createResultDiv(result);
}

// Receive info from the server that the game has ended in a forfeiture.
socketio.on("forfeitureEnd", (data) => forfeitureReceiver(data));
function forfeitureReceiver(data){
  createResultDiv("Game over by forfeiture, " + data.whoWon + " wins!");
  gameEndHandler();
}

function createResultDiv(result){
  let result_div = document.createElement("div");
  result_div.classList.add("result");
  result_div.id = "result-div";
  result_div.textContent = result;
  resultDivTimeoutPtr = setTimeout((result_div) => document.getElementById("result-div").remove(), resultDivTimeout * 1000)
  body.appendChild(result_div);
}

function movePiece(sourceSqr, destinationSqr, promotedPiece) {
  //setting the values of castlingPossible and enPassant for this function locally
  if (
    board[sourceSqr[0]][sourceSqr[1]] == 7 ||
    board[sourceSqr[0]][sourceSqr[1]] == -7
  ) {
    //dist is col distance
    let dist = destinationSqr[1] - sourceSqr[1];
    //if king moved morethan 2 squares it means it is castle
    if (dist > 1 || dist < -1) castlingPossible = true;
  }
  if (
    board[sourceSqr[0]][sourceSqr[1]] == 1 ||
    board[sourceSqr[0]][sourceSqr[1]] == -1
  ) {
    if (sourceSqr[1] != destinationSqr[1]) {
      if (board[destinationSqr[0]][destinationSqr[1]] == 0)
        enPassant = destinationSqr[1];
    }
  }
  //updating castling variables
  {
    if (sourceSqr[0] === 0 && sourceSqr[1] === 0) bQRookMoved = true;
    else if (sourceSqr[0] === 0 && sourceSqr[1] === 7) bKRookMoved = true;
    else if (sourceSqr[0] === 7 && sourceSqr[1] === 7) wKRookMoved = true;
    else if (sourceSqr[0] === 7 && sourceSqr[1] === 0) wQRookMoved = true;
    else if (sourceSqr[0] === 0 && sourceSqr[1] === 4) bKingMoved = true;
    else if (sourceSqr[0] === 7 && sourceSqr[1] === 4) wKingMoved = true;
  }
  //clearing any piece in destination sqr and source sqr also
  squares[sourceSqr[0]][sourceSqr[1]].innerHTML = "";
  squares[destinationSqr[0]][destinationSqr[1]].innerHTML = "";
  //putting the piece in destination sqr and emptying source sqr
  board[destinationSqr[0]][destinationSqr[1]] =
    board[sourceSqr[0]][sourceSqr[1]];
  //if moved piece is a pawn, and if it reached 0th row or 7th row then put a queen there
  if (
    board[sourceSqr[0]][sourceSqr[1]] === 1 ||
    board[sourceSqr[0]][sourceSqr[1]] === -1
  ) {
    if(destinationSqr[0]===0||destinationSqr[0]===7)
      board[destinationSqr[0]][destinationSqr[1]] = promotedPiece;
  }
  board[sourceSqr[0]][sourceSqr[1]] = 0;
  //adding piece to final sqr
  addImgToSqr(
    squares[destinationSqr[0]][destinationSqr[1]],
    board[destinationSqr[0]][destinationSqr[1]],
  );
  //if castling is enabled and destination sqrs col is either 2 or 6, then put the rook at the correct position
  //also selected piece has to be king
  if (
    board[destinationSqr[0]][destinationSqr[1]] === 7 ||
    board[destinationSqr[0]][destinationSqr[1]] === -7
  ) {
    if (castlingPossible && destinationSqr[1] === 2) {
      board[sourceSqr[0]][3] = board[sourceSqr[0]][0];
      board[sourceSqr[0]][0] = 0;
      addImgToSqr(squares[sourceSqr[0]][3], board[sourceSqr[0]][3]);
      squares[sourceSqr[0]][0].innerHTML = "";
    } else if (castlingPossible && destinationSqr[1] === 6) {
      board[sourceSqr[0]][5] = board[sourceSqr[0]][7];
      board[sourceSqr[0]][7] = 0;
      addImgToSqr(squares[sourceSqr[0]][5], board[sourceSqr[0]][5]);
      squares[sourceSqr[0]][7].innerHTML = "";
    }
  }
  //if enpassant is possible
  if (enPassant !== -1 && destinationSqr[1] === enPassant) {
    board[sourceSqr[0]][enPassant] = 0;
    squares[sourceSqr[0]][enPassant].innerHTML = "";
  }
}

function makeAMove(move, restore) {
  try {
    //update the move
    moves.push(move);
    movePiece(move[0], move[1],move[3]);
    if (!restore) {
      white_move = !white_move;
      if (isGameOver()) gameOver();
    } else white_move = move[2] === "Black"; // Check who made the most recent move, and if it's black, it's white's turn next. Else, it isn't.
  } catch (error) {
    console.log(error);
  }
}

// Call makeAMove function after receiving response from server, only if it is this player's turn to move.
socketio.on("play", (data) => {
  if (color !== data.moveMadeBy)
    makeAMove([data.source, data.destination,data.moveMadeBy,data.promotedPiece], false);
});

// Restore state of game upon disconnection and the like.
socketio.on("restoreState", (data) => {
  makeAMove([data.source, data.destination, data.moveMadeBy,data.promotedPiece], true);
});

// ------------------------------------------------------------------------------------------------
// Waiting room JS

const waitingRoom = document.getElementById("waiting-room");
const messageAlert = document.getElementById("messageAlert");
const messages = document.getElementById("messages");
const startGameButton = document.getElementById("startGame");
const failedToStartGameModal = document.getElementById("failedToStartGame");
const failedToStartGameHeading = document.getElementById("failureMessageHeading");
const failedToStartGameMessage = document.getElementById("failureMessage");
const gameBoard = document.getElementById("entire-board");
const player1 = document.getElementById("player-1");
const player2 = document.getElementById("player-2");
const chatInput = document.getElementById("chatInput");
const logOutButton = document.getElementById("logoutButton");
const game=document.getElementById("game");
let currNumPlayers = 0;
let color;

socketio.on("playerAlerts", (data) => {
  messageAlert.textContent = data.name + " " + data.message;
  animateMessage(messageAlert);
  currNumPlayers = parseInt(data.playerCount);
  player1.textContent = data.player1;
  if (data.player2 !== "")
    player2.textContent = data.player2;
  else player2.textContent = "...";
});

startGameButton.addEventListener("click", () => {
  if (currNumPlayers < 2) {
    failedToStartGameHeading.innerHTML = `Insufficient players`;
    failedToStartGameMessage.textContent=` To start the game, You need exactly 2 players. You currently have ${currNumPlayers}.`;
    failedToStartGameModal.showModal();
  } else sendMessage("game", "start");
});

socketio.on("start", (data) => {
  color = data.color;
  console.log(data.color);
  waitingRoom.classList.toggle("invisible");
  game.classList.toggle("invisible");
  document.title = "Game in progress...";
  logOutButton.innerText = "Forfeit Game";
  logOutButton.value = "forfeit";
  createBoard();
});

function createMessage(name, message) {
  const content = `
  <div class="message">
    <span>
      <strong>${name}</strong>: ${message}
    </span>
    <span class="muted">
      ${new Date().toLocaleString()}
    </span>
  </div>
  `;
  messages.innerHTML += content;
  messages.scrollTop=messages.scrollHeight-messages.clientHeight;
}

socketio.on("chat", (data) => {
  createMessage(data.name, data.message);
});

function sendChatMessage() {
  if(chatInput.value){
    sendMessage("chat", chatInput.value);
    chatInput.value = "";
  }
}

function sendMessage(event, message) {
  if (message === "") return;
  socketio.emit(event, { data: message }); // EMIT AN EVENT FROM CLIENT WHICH WE CAN LISTEN TO ON OUR SERVER.
}

socketio.on("redirect", (destination) => {
  window.location.href = destination;
});

socketio.on("gameEnded", () => gameEndHandler());
function gameEndHandler(){
  console.log("The previous game ended. Going back to the waiting room.")
  gameBoard.innerHTML = ``;
  game.classList.toggle("invisible");
  waitingRoom.classList.toggle("invisible");
  logOutButton.innerText = "Leave Room";
  logOutButton.value = "leave";
}

function animateMessage(div) {
  div.animate([{ transform: "translate(-100%,0)" }], {
    duration: 500,
    fill: "forwards",
  });
  setTimeout(() => {
    div.animate(
      { transform: "translate(0,0)" },
      { duration: 500, fill: "forwards" },
    );
  }, 2000);
}

logOutButton.addEventListener("click", () => {
  // logOutButton's value is either leave or forfeit.
  if(logOutButton.value === "leave") socketio.emit("leaveRoom");
  else{
    let winner = color === "Black" ? "White" : "Black";
    let outcome = "Game over by forfeiture, " + winner + " wins!";
    socketio.emit("gameOver", {outcome: "Forfeiture", whoWon: winner});
    createResultDiv(outcome);
  }
})
