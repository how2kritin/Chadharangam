const boardHtml=document.querySelector(".board");
const body=document.querySelector("body");
let white_pov=true;
let white_move=true;
let clickedSqr=false;
let sourceSqr,destinationSqr;
let legalMoves=[];
let squares=[];
let moves=[];
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
        if(isLega(destinationSqr)){
            //finding coords of destination sqr
            //clearing any piece in destination sqr and source sqr also
            squares[sourceSqr[0]][sourceSqr[1]].innerHTML="";
            squares[destinationSqr[0]][destinationSqr[1]].innerHTML="";
            //putting the piece in destination sqr and emptying source sqr
            board[destinationSqr[0]][destinationSqr[1]]=board[sourceSqr[0]][sourceSqr[1]];
            board[sourceSqr[0]][sourceSqr[1]]=0;
            //adding piece to final sqr
            addImgToSqr(squares[destinationSqr[0]][destinationSqr[1]],board[destinationSqr[0]][destinationSqr[1]]);
            //updating moves
            moves.push([sourceSqr,destinationSqr]);
            //clearing hightlighted squares
            //give the chance to other player
            white_move=!white_move;
        }
        destinationSqr=[-1,-1];
        sourceSqr=[-1,-1];
        highlightSqrs(false);
        clickedSqr=false;
    }else{
        sourceSqr=findSqr(this);
        if((board[sourceSqr[0]][sourceSqr[1]]>0&&white_move)||((board[sourceSqr[0]][sourceSqr[1]]<0&&!white_move))){
            clickedSqr=true;
            legalMoves=movesFinder(sourceSqr,board[sourceSqr[0]][sourceSqr[1]]);
            highlightSqrs(true);
        }else{
            sourceSqr=undefined;
            highlightSqrs(false);
            clickedSqr=false;
        }
        console.log(sourceSqr);
    }
}

function highlightSqrs(yes){
    for(let i=0;i<legalMoves.length;i++){
        squares[legalMoves[i][0]][legalMoves[i][1]].style.border=(yes)?"2px solid black":"";
    }
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
            possibleMoves.push([r,c]);
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
    return possibleMoves;
}