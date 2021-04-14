class Piece {
  constructor(type, x, y, w) {
    this.type = type;
    this.pos = { x: x, y: y };
    this.image = document.createElement('img');
    this.moveNr = 0;

    if (w) {
      this.team = 'w';
    } else {
      this.team = 'b';
    }

    this.image.src = '/play/assets/' + this.team + this.type + '.png';
    this.image.style.display = 'block';
    this.image.style.position = "absolute";
    this.image.style.width = '100%';
    this.image.style.height = '100%';
    this.image.style.zIndex = 5;
    this.container = document.createElement('div');
    this.container.style.display = 'block';
    this.container.style.position = "absolute";
    this.container.appendChild(this.image);
    this.container.style.cursor = 'hand';
    dragPiece(this);

    document.getElementById('board').appendChild(this.container);
  }
  type() {
    return this.type;
  }
  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }
  remove() {
    this.container.remove();
  }
  hide() {
    this.image.style.display = 'none';
    this.container.style.display = 'none';
  }
  show() {
    this.container.style.width = PXsize;
    this.container.style.height = PXsize;
    this.container.style.top = PXsize * this.pos.y + 'px';
    this.container.style.left = PXsize * this.pos.x + 'px';
    this.container.style.display = 'block';
    this.image.style.display = 'block';
  }




  showMoves() {
    let possible = [];
    if (this.type != N) {
      for (let mov of move[this.type].direction) {
        let m = colrow(mov);
        for (let step of move[this.type].step) {
          if (this.pos.y + (m.y * step) < 8 && this.pos.x + (m.x * step) < 8 &&
            this.pos.y + (m.y * step) >= 0 && this.pos.x + (m.x * step) >= 0) {
            if (board[this.pos.y + (m.y * step)][this.pos.x + (m.x * step)] == 0
              || (((m.y * step) == 0 && (m.x * step) == 0) || board[this.pos.y + (m.y * step)][this.pos.x + (m.x * step)].team != this.team)) {
              possible.push({ x: this.pos.x + (m.x * step), y: this.pos.y + (m.y * step) });
            }
          }
        }
      }
    }


    console.log(possible);
    return possible;
  }
}