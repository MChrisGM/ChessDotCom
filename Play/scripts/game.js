let board = [];
const K = 'k';
const Q = 'q';
const B = 'b';
const N = 'n';
const R = 'r';
const P = 'p';
let W = true;
var PXsize;

const move = {
  k: { direction: [1, 2, 3, 4, 5, 6, 7, 8, 9], step: [1] },
  q: { direction: [1, 2, 3, 4, 5, 6, 7, 8, 9], step: [1, 2, 3, 4, 5, 6, 7, 8] },
  b: { direction: [1, 3, 7, 9], step: [1, 2, 3, 4, 5, 6, 7, 8] },
  n: { direction: [2, 4, 6, 8], step: [4], combinations: [] },
  r: { direction: [2, 4, 6, 8], step: [1, 2, 3, 4, 5, 6, 7, 8] },
  p: { direction: [1, 2, 3, 5], step: [1] }
};

// 1,2,3,
// 4,5,6,
// 7,8,9  -> x,y

function colrow(move) {
  if (move != 0 && move > 0 && move < 10 && typeof move == 'number') {
    let y = Math.ceil(move / 3) - 2;
    if (move > 3) { move -= 3; if (move > 3) { move -= 3; } }
    let x = move - 2;
    return { x, y };
  }
}

function reset_board() {
  board = [
    [R,N,B,Q,K,B,N,R],
    [P,P,P,P,P,P,P,P],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [P,P,P,P,P,P,P,P],
    [R,N,B,Q,K,B,N,R]
  ];

  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      if(board[y][x]!=0){
        if(y<3){
          board[y][x] = new Piece(board[y][x],x,y,!W);
        }else{
          board[y][x] = new Piece(board[y][x],x,y,W);
        }
        board[y][x].hide();
      }
    }
  }
}

function display_board(){
  PXsize = document.getElementById('board').clientWidth/8;
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      if(board[y][x]!=0){
        board[y][x].show();
      }
    }
  }
}

window.onload = function() {
  setup();
  reset_board();
  display_board();
}

window.onresize = function(){
  display_board();
}