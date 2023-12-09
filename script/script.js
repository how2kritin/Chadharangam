const boardHtml=document.querySelector(".board");
const body=document.querySelector("body");
let white_pov=true;
let drag=false;
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
//adding pieces
for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
        if(board[i][j]){
            let img=document.createElement("img");
            img.classList.add("piece");
            img.src="./images/"+intToPngName(board[i][j])+".png";
            squares[i][j].appendChild(img);
        }
    }
}

