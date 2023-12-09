const board=document.querySelector(".board");
let white_pov=true;
let squares=[];
//making board and storing references in squares 2d array
for(let i=0;i<8;i++){
    let row=[];
    for(let j=0;j<8;j++){
        row.push(document.createElement("div"));
        if(((i+j)%2==0)&&white_pov){
            console.log(i+" "+j);
            row[j].classList.add("white");
        }else{
            row[j].classList.add("black");
        }
        board.appendChild(row[j]);
    }
    squares.push(row);
}