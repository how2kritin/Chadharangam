const boardHtml=document.querySelector(".board");
const body=document.querySelector("body");
let white_pov=true;
let white_move=true;
let clickedSqr=false;
let sourceSqr,destinationSqr;
let over=false;
//parameters for castling
let wQRookMoved=false,wKRookMoved=false,bKRookMoved=false,bQRookMoved=false;
let bKingMoved=false,wKingMoved=false;
let castlingPossible=false;
let enPassant=-1;
let legalMoves=[];
let squares=[];
let moves=[],nmoves=0;
let board=[
    [-5,-2,-3,-9,-10,-3,-2,-5],
    [-1,-1,-1,-1,-1,-1,-1,-1],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1],
    [5,2,3,9,10,3,2,5]
];
let test=document.querySelector("#test");
let piece_selected,sqr_selected,sqr_released;
//function that takes piece value as input and returns its name corresponding to its png
function intToPngName(piece){
    let name;
    if(piece<0) {
        name='b';
        name=name+(0-piece);
    }
    else if(piece>0) {
        name='w';
        name=name+piece;
    }
    return name;
}
//function that takes a square(div) as input and returns position in the board (int)
function findSqr(div_ref){
    for(let i=0;i<8;i++){
        for(let j=0;j<8;j++){
            if(squares[i][j]==div_ref) return [i,j];
        }
    }
}
//making board and storing references in squares 2d array
for(let i=0;i<8;i++){
    let row=[];
    for(let j=0;j<8;j++){
        row.push(document.createElement("div"));
        if(((i+j)%2==0)&&white_pov){
            row[j].classList.add("white");
        }else{
            row[j].classList.add("black");
        }
        boardHtml.appendChild(row[j]);
    }
    squares.push(row);
}
function addImgToSqr(square,piece){
    let img=document.createElement("img");
    img.classList.add("piece");
    img.src="./images/"+intToPngName(piece)+".png";
    square.appendChild(img);
}
//adding pieces
for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
        squares[i][j].addEventListener("click",sqrClickedListener);
        if(board[i][j]){
            addImgToSqr(squares[i][j],board[i][j]);
        }
    }
}
function isLegal(destSqr){
    for(let i=0;i<legalMoves.length;i++){
        if(legalMoves[i][0]==destSqr[0]&&legalMoves[i][1]==destSqr[1]) return true;
    }
    return false;
}
//function when a square is clicked
function sqrClickedListener(event){
    if(clickedSqr){
        destinationSqr=findSqr(this);
        if(isLegal(destinationSqr)){
            //finding coords of destination sqr
            //updating castling variables
            if(sourceSqr[0]==0&&sourceSqr[1]==0) bQRookMoved=true;
            else if(sourceSqr[0]==0&&sourceSqr[1]==7) bKRookMoved=true;
            else if(sourceSqr[0]==7&&sourceSqr[1]==7) wKRookMoved=true;
            else if(sourceSqr[0]==7&&sourceSqr[1]==0) wQRookMoved=true;
            else if(sourceSqr[0]==0&&sourceSqr[1]==4) bKingMoved=true;
            else if(sourceSqr[0]==7&&sourceSqr[1]==4) wKingMoved=true;
            //clearing any piece in destination sqr and source sqr also
            squares[sourceSqr[0]][sourceSqr[1]].innerHTML="";
            squares[destinationSqr[0]][destinationSqr[1]].innerHTML="";
            //putting the piece in destination sqr and emptying source sqr
            board[destinationSqr[0]][destinationSqr[1]]=board[sourceSqr[0]][sourceSqr[1]];
            board[sourceSqr[0]][sourceSqr[1]]=0;
            //adding piece to final sqr
            addImgToSqr(squares[destinationSqr[0]][destinationSqr[1]],board[destinationSqr[0]][destinationSqr[1]]);
            //if castling is enabled and destination sqrs col is either 2 or 6, then put the rook at the correct position
            //also selected piece has to be king
            if(board[destinationSqr[0]][destinationSqr[1]]==10||board[destinationSqr[0]][destinationSqr[1]]==-10){
                if(castlingPossible&&destinationSqr[1]==2){
                    board[sourceSqr[0]][3]=board[sourceSqr[0]][0];
                    board[sourceSqr[0]][0]=0;
                    addImgToSqr(squares[sourceSqr[0]][3],board[sourceSqr[0]][3]);
                    squares[sourceSqr[0]][0].innerHTML="";
                }
                else if(castlingPossible&&destinationSqr[1]==6){
                    board[sourceSqr[0]][5]=board[sourceSqr[0]][7];
                    board[sourceSqr[0]][7]=0;
                    addImgToSqr(squares[sourceSqr[0]][5],board[sourceSqr[0]][5]);
                    squares[sourceSqr[0]][7].innerHTML="";
                }
            }
            //if enpassant is possible
            if(enPassant!=-1&&destinationSqr[1]==enPassant){
                board[sourceSqr[0]][enPassant]=0;
                squares[sourceSqr[0]][enPassant].innerHTML="";
            }
            //updating moves
            moves.push([sourceSqr,destinationSqr]);
            nmoves++;
            //give the chance to other player
            white_move=!white_move;
        }
        squares[sourceSqr[0]][sourceSqr[1]].classList.remove("pieceSelected");
        destinationSqr=[-1,-1];
        sourceSqr=[-1,-1];
        //clearing hightlighted squares
        highlightSqrs(false);
        clickedSqr=false;
        if(isGameOver()) gameOver();
    }else{
        sourceSqr=findSqr(this);
        if((board[sourceSqr[0]][sourceSqr[1]]>0&&white_move)||((board[sourceSqr[0]][sourceSqr[1]]<0&&!white_move))){
            clickedSqr=true;
            castlingPossible=false;
            enPassant=-1;
            legalMoves=legalMovesFinder(sourceSqr,board[sourceSqr[0]][sourceSqr[1]]);
            squares[sourceSqr[0]][sourceSqr[1]].classList.add("pieceSelected");
            highlightSqrs(true);
        }else{
            sourceSqr=[-1,-1];
            clickedSqr=false;
        }
        console.log(sourceSqr);
    }
}

function highlightSqrs(yes){
    for(let i=0;i<legalMoves.length;i++){
        // squares[legalMoves[i][0]][legalMoves[i][1]].style.border=(yes)?"2px solid black":"";
        squares[legalMoves[i][0]][legalMoves[i][1]].classList.toggle("selected");
    }
}

function isInCheck(white){
    //if white is true,check if white king is in check and return true if it is indeed in check
    //if white is false,check if black king is in check
    let r,c;
    for(let i=0;i<8;i++){
        for(let j=0;j<8;j++){
            if((white&&board[i][j]==10)||(!white&&board[i][j]==-10)){r=i;c=j;}
        }
    }
    console.log("king is at "+r+" "+c);
    let attackingPieces=[1,2,3,5,9,10];
    for(let i=0;i<6;i++){
        let attackingSpots=movesFinder([r,c],(white)?attackingPieces[i]:(0-attackingPieces[i]));
        console.log("attacking piece "+attackingPieces[i]);
        console.log(attackingSpots);
        for(let j=0;j<attackingSpots.length;j++){
            if(board[attackingSpots[j][0]][attackingSpots[j][1]]==((!white)?attackingPieces[i]:(0-attackingPieces[i]))) {console.log(attackingPieces[i]);return true;}
        }
    }
    return false;
}

//returns all posibble ways a piece can go to irrespective of legal or not
function movesFinder(position,piece){
    let possibleMoves=[];
    //possible moves if it is a pawn
    if(piece==1||piece==-1){
        //if white, row-- or if black,row++
        let r=position[0]-piece,c=position[1];
        //if there is no piece in front, you can go there
        if(r>=0&&r<8&&c>=0&&c<8&&!board[r][c]) possibleMoves.push([r,c]);
        //if diagonally, there is an opponents piece, you can take it
        if(c-1>=0&&((board[r][c-1]<0&&piece>0)||(board[r][c-1]>0&&piece<0))) {possibleMoves.push([r,c-1]);console.log("can capture");}
        if(c+1<8&&((board[r][c+1]<0&&piece>0)||(board[r][c+1]>0&&piece<0))) {possibleMoves.push([r,c+1]);console.log("can capture");}
        //if pawn is on 2nd rank or 7th rank, you can have 2 moves
        if(position[0]==1||position[0]==6){
            r=position[0]-2*piece,c=position[1];
            if(!board[r][c]&&!(board[r+piece][c])) possibleMoves.push([r,c]);
        }
        //and the most important move.. en passant
        r=position[0];c=position[1];
        //if latest move is made by a pawn, and the pawn has made 2 moves for its first move and the pawn is adjacent to the selected pawn,, en passant is possible
        if(white_move&&nmoves>0&&r==3){
            if(board[moves[nmoves-1][1][0]][moves[nmoves-1][1][1]]==-1){
                if(moves[nmoves-1][1][0]-moves[nmoves-1][0][0]==2){
                    let t=moves[nmoves-1][1][1];
                    t-=c;
                    if(t==1||t==-1){
                        possibleMoves.push([r-1,c+t]);
                        enPassant=c+t;
                    }
                }
            }
        }
        if(!white_move&&r==4){
            if(board[moves[nmoves-1][1][0]][moves[nmoves-1][1][1]]==1){
                if(moves[nmoves-1][1][0]-moves[nmoves-1][0][0]==-2){
                    let t=moves[nmoves-1][1][1];
                    t-=c;
                    if(t==1||t==-1){
                        possibleMoves.push([r+1,c+t]);
                        enPassant=c+t;
                    }
                }
            }
        }
    }
    //possible moves if it is a rook (or a queen)
    if(piece==5||piece==-5||piece==9||piece==-9){
        let r=position[0],c=position[1];
        //going right
        while(true){
            c++;
            if(c>7) break;
            //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
            if((board[r][c]>0&&piece>0)||(board[r][c]<0&&piece<0)) break;
            possibleMoves.push([r,c]);
            if(board[r][c]) break;
        }
        //going left
        c=position[1];
        while(true){
            c--;
            if(c<0) break;
            //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
            if((board[r][c]>0&&piece>0)||(board[r][c]<0&&piece<0)) break;
            possibleMoves.push([r,c]);
            if(board[r][c]) break;
        }
        //going down
        c=position[1];
        while(true){
            r++;
            if(r>7) break;
            if((board[r][c]>0&&piece>0)||(board[r][c]<0&&piece<0)) break;
            possibleMoves.push([r,c]);
            if(board[r][c]) break;
        }
        //going down
        r=position[0];
        while(true){
            r--;
            if(r<0) break;
            if((board[r][c]>0&&piece>0)||(board[r][c]<0&&piece<0)) break;
            possibleMoves.push([r,c]);
            if(board[r][c]) break;
        }
    }
    //possible moves if it is a bishop (or a queen)
    if(piece==3||piece==-3||piece==9||piece==-9){
        let r=position[0],c=position[1];
        //going up-right
        while(true){
            c++;r--;
            if(c>7||r<0) break;
            //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
            if((board[r][c]>0&&piece>0)||(board[r][c]<0&&piece<0)) break;
            possibleMoves.push([r,c]);
            if(board[r][c]) break;
        }
        //going down-right
        r=position[0];c=position[1];
        while(true){
            c++;r++;
            if(c>7||r>7) break;
            //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
            if((board[r][c]>0&&piece>0)||(board[r][c]<0&&piece<0)) break;
            possibleMoves.push([r,c]);
            if(board[r][c]) break;
        }
        //going up-left
        r=position[0];c=position[1];
        while(true){
            c--;r--;
            if(c<0||r<0) break;
            //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
            if((board[r][c]>0&&piece>0)||(board[r][c]<0&&piece<0)) break;
            possibleMoves.push([r,c]);
            if(board[r][c]) break;
        }
        //going down-left
        r=position[0];c=position[1];
        while(true){
            c--;r++;
            if(r>7||c<0) break;
            //if the current piece and piece at [r][c] are same color you cant go there. so break and stop searching further
            if((board[r][c]>0&&piece>0)||(board[r][c]<0&&piece<0)) break;
            possibleMoves.push([r,c]);
            if(board[r][c]) break;
        }
    }
    //possible moves if its a knight
    if(piece==2||piece==-2){
        let r=position[0],c=position[1];
        for(let i=-2;i<=2;i++){
            for(let j=-2;j<=2;j++){
                if(i&&j&&i!=j&&i!=(0-j)){
                    if(r+i>=0&&r+i<8&&c+j>=0&&c+j<8){
                        if((board[r+i][c+j]<=0&&piece>0)||(board[r+i][c+j]>=0&&piece<0)) possibleMoves.push([r+i,c+j]);
                    }
                }
            }
        }
    }
    //possible moves if its a king
    if(piece==10||piece==-10){
        let r=position[0],c=position[1];
        for(let i=-1;i<=1;i++){
            for(let j=-1;j<=1;j++){
                //if atleast i or j are non zeroes, then king can go there
                if((i||j)&&r+i>=0&&r+i<8&&c+j>=0&&c+j<8){
                    if((board[r+i][c+j]>=0&&piece<0)||(board[r+i][c+j]<=0&&piece>0)){console.log((r+i)+" "+(c+j)); possibleMoves.push([r+i,c+j]);}
                }
            }
        }
        //if the possibleMoves contains a negative , then it is castling
        if((piece>0&&!wKingMoved&&!wKRookMoved&&!board[r][c+1]&&!board[r][c+2])||(piece<0&&!bKingMoved&&!bKRookMoved&&!board[r][c+1]&&!board[r][c+2])) {possibleMoves.push([r,c+2]);castlingPossible=true;}
        if((piece>0&&!wKingMoved&&!wQRookMoved&&!board[r][c-1]&&!board[r][c-2]&&!board[r][c-3])||(piece<0&&!bKingMoved&&!bQRookMoved&&!board[r][c-1]&&!board[r][c-2]&&!board[r][c-3])){ possibleMoves.push([r,c-2]); castlingPossible=true;}
    }
    return possibleMoves;
}

function legalMovesFinder(position,piece){
    let allPossibleMoves=movesFinder(position,piece);
    let allLegalMoves=[];
    for(let i=0;i<allPossibleMoves.length;i++){
        //make the move
        let t=board[allPossibleMoves[i][0]][allPossibleMoves[i][1]];
        board[allPossibleMoves[i][0]][allPossibleMoves[i][1]]=board[position[0]][position[1]];
        board[position[0]][position[1]]=0;
        //if your king in check, dont add it to legalMoves
        //if your king is not in check, add it
        if((white_move&&!isInCheck(true))||(!white_move&&!isInCheck(false))) allLegalMoves.push(allPossibleMoves[i]);
        //redo the move
        board[position[0]][position[1]]=board[allPossibleMoves[i][0]][allPossibleMoves[i][1]];
        board[allPossibleMoves[i][0]][allPossibleMoves[i][1]]=t;
    }
    return allLegalMoves;
}

function isGameOver(){
    for(let i=0;i<8;i++){
        for(let j=0;j<8;j++){
            if((white_move&&board[i][j]>0)||(!white_move&&board[i][j]<0)){
                if(legalMovesFinder([i,j],board[i][j]).length!=0) return false;
            }
        }
    }
    return true;
}

function gameOver(){
    over=true;
    let result;
    if((white_move&&isInCheck(true))||(!white_move&&isInCheck(false))) result="CheckMate";
    else result="StaleMate";
    let result_div=document.createElement("div");
    result_div.classList.add("result");
    result_div.textContent=result;
    body.appendChild(result_div);
}
