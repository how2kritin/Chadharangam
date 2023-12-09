const boardHtml=document.querySelector(".board");
const body=document.querySelector("body");
let white_pov=true;
let white_move=true;
let clickedSqr=false;
let sourceSqr,destinationSqr;
let possibleMoves=[];
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
//function when a square is clicked
function sqrClickedListener(event){
    if(clickedSqr){
        destinationSqr=findSqr(this);
        squares[sourceSqr[0]][sourceSqr[1]].innerHTML="";
        squares[destinationSqr[0]][destinationSqr[1]].innerHTML="";
        board[destinationSqr[0]][destinationSqr[1]]=board[sourceSqr[0]][sourceSqr[1]];
        if(sourceSqr[0]!=destinationSqr[0]&&sourceSqr[1]!=destinationSqr[1]) board[sourceSqr[0]][sourceSqr[1]]=0;
        addImgToSqr(squares[destinationSqr[0]][destinationSqr[1]],board[destinationSqr[0]][destinationSqr[1]]);
        moves.push([sourceSqr,destinationSqr]);
        highlightSqrs(false);
        clickedSqr=false;
        white_move=!white_move;
    }else{
        sourceSqr=findSqr(this);
        if((board[sourceSqr[0]][sourceSqr[1]]>0&&white_move)||((board[sourceSqr[0]][sourceSqr[1]]<0&&!white_move))){
            clickedSqr=true;
            movesFinder(sourceSqr,board[sourceSqr[0]][sourceSqr[1]]);
            highlightSqrs(true);
            console.log("piece held");
        }else{
            sourceSqr=undefined;
            highlightSqrs(false);
            clickedSqr=false;
        }
        console.log(sourceSqr);
    }
}

function highlightSqrs(yes){
    for(let i=0;i<possibleMoves.length;i++){
        squares[possibleMoves[i][0]][possibleMoves[i][1]].style.border=(yes)?"10px solid black":"";
    }
}

function movesFinder(position,piece){
    possibleMoves=[];
    if(piece==1||piece==-1){
        let r=position[0]-piece,c=position[1];
        if(r>=0&&r<8&&c>=0&&c<8&&!board[r][c]) possibleMoves.push([r,c]);
        if(c-1>=0&&board[r][c-1]) {possibleMoves.push([r,c-1]);console.log("can capture");}
        if(c+1<8&&board[r][c+1]) {possibleMoves.push([r,c+1]);console.log("can capture");}
        if(position[0]==1||position[0]==6){
            r=position[0]-2*piece,c=position[1];
            if(r>=0&&r<8&&c>=0&&c<8&&!board[r][c]) possibleMoves.push([r,c]);
        }
    }
}