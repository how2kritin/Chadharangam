const boardHtml=document.querySelector(".board");
const body=document.querySelector("body");
let white_pov=true;
let clickedSqr=false;
let sourceSqr,destinationSqr;
let squares=[];
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
        addImgToSqr(squares[destinationSqr[0]][destinationSqr[1]],board[destinationSqr[0]][destinationSqr[1]]);
        clickedSqr=false;
    }else{
        sourceSqr=findSqr(this);
        if(board[sourceSqr[0]][sourceSqr[1]]){
            clickedSqr=true;
        }else{
            sourceSqr=undefined;
            clickedSqr=false;
        }
        console.log(sourceSqr);
    }
}