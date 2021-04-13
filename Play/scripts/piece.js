class Piece{
  constructor(type,x,y,w){
    this.type = type;
    this.pos = {x:x,y:y};
    this.image = document.createElement('img');
    
    if(w){
      this.team='w';
    }else{
      this.team='b';
    }

    this.image.src='/play/assets/'+this.team+this.type+'.png';
    this.image.style.display = 'block';
    this.image.style.position = "absolute";
    this.image.style.width='100%';
    this.image.style.height='100%';
    this.container = document.createElement('div');
    this.container.style.display = 'block';
    this.container.style.position = "absolute";
    this.container.appendChild(this.image);
    this.container.style.cursor = 'hand';
    dragPiece(this);
    
    document.getElementById('board').appendChild(this.container);
  }
  type(){
    return this.type;
  }
  setPos(x,y){
    this.pos.x=x;
    this.pos.y=y;
  }
  remove(){
    this.container.remove();
  }
  hide(){
    this.image.style.display = 'none';
    this.container.style.display = 'none';
  }
  show(){
    this.container.style.width=PXsize;
    this.container.style.height=PXsize;
    this.container.style.top=PXsize*this.pos.y+'px';
    this.container.style.left=PXsize*this.pos.x+'px';
    this.container.style.display = 'block';
    this.image.style.display = 'block';
  }
}