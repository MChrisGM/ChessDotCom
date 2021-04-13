let socket;
const discordRedirect = "https://discord.com/api/oauth2/authorize?client_id=831317360677355592&redirect_uri=https%3A%2F%2Fchessdotcom.mchrisgm.repl.co&response_type=code&scope=identify&prompt=none"

function discordLogin() {
  window.location.href = discordRedirect;
}

function parseURLParams(url) {
  var queryStart = url.indexOf("?") + 1,
    queryEnd = url.indexOf("#") + 1 || url.length + 1,
    query = url.slice(queryStart, queryEnd - 1),
    pairs = query.replace(/\+/g, " ").split("&"),
    parms = {}, i, n, v, nv;

  if (query === url || query === "") return;

  for (i = 0; i < pairs.length; i++) {
    nv = pairs[i].split("=", 2);
    n = decodeURIComponent(nv[0]);
    v = decodeURIComponent(nv[1]);

    if (!parms.hasOwnProperty(n)) parms[n] = [];
    parms[n].push(nv.length === 2 ? v : null);
  }
  return parms;
}

function setup() {
  socket = io.connect(window.location.origin);
  if (localStorage.getItem('user_id') != null) {
    socket.emit('user_id', localStorage.getItem('user_id'));
  } else {
    localStorage.setItem('user_id', socket.id);
  }
  let code = parseURLParams(window.location.href) || null;
  if (code) {
    code = parseURLParams(window.location.href)['code'];
    if (code) {
      code = parseURLParams(window.location.href)['code'][0]
    }
  }
  if (code) {
    socket.emit('validate_discord_code', code);
  }
  socket.on('discord_validation', function(user) {
    document.querySelector('#profile-name').textContent = "Logged in as " + user.USER_NAME + "#" + user.USER_DISC;
    document.querySelector('#profile-name').style.display = 'block';
    document.querySelector('#login-button').style.display = 'none';
  });
  socket.on('invalid_id', function() {
    console.log("Invalid ID");
    localStorage.setItem('user_id', socket.id);
  });

  createResizeableBoard();

}

function createResizeableBoard() {
  const board = document.querySelector('#board');
  const resizer = document.querySelector('.handle');
  const game_div = document.querySelector('#gameDiv');

  // get min of gameDiv width and height so resizer do not go out of view
  const gameDiv_width = parseFloat(getComputedStyle(game_div , null).getPropertyValue('width').replace('px', ''));
  const gameDiv_height = parseFloat(getComputedStyle(game_div , null).getPropertyValue('height').replace('px', ''));
  const maximum_size = Math.min(gameDiv_width, gameDiv_height);
  
  const minimum_size = 0.1*gameDiv_width;

  let original_size = 0;
  let original_mouse_x = 0;

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    // set size to either height or width because we want 1:1 aspect ratio
    original_size = parseFloat(getComputedStyle(board, null).getPropertyValue('width').replace('px', ''));
    // mouse position on the page
    original_mouse_x = e.pageX;
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResize)
  })

  function resize(e) {
    const new_size = original_size + (e.pageX - original_mouse_x);
    if (new_size > minimum_size && new_size < maximum_size) {
      board.style.width = new_size + 'px';
      board.style.height = new_size + 'px';
    } 
    else if (new_size < minimum_size) {
      board.style.width = minimum_size + 'px';
      board.style.height = minimum_size + 'px';
    }
    else if (new_size > maximum_size) {
      board.style.width = maximum_size + 'px';
      board.style.height = maximum_size + 'px';
    }
    display_board();
  }

  // clean up so that mousemove 
  function stopResize(e) {
    window.removeEventListener('mousemove', resize);
    
  }
}

function dragPiece(piece) {
  let elmnt = piece.container;
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  elmnt.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;

    snapToBoard(piece);
  }
}
function dist(x1,y1,x2,y2){
  let a = x1 - x2;
  let b = y1 - y2;
  return Math.sqrt( a*a + b*b ); 
}

function snapToBoard(piece){
  let min = 100000;
  let xpos = parseFloat(piece.container.style.left.replace('px',''));
  let ypos = parseFloat(piece.container.style.top.replace('px',''));
  let finalX;
  let finalY;
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      let xref = x*PXsize;
      let yref = y*PXsize;
      let d = dist(xpos,ypos,xref,yref);
      if(d<min){
        finalX = x;
        finalY = y;
        min = d;
      }
    }
  }
  if(board[finalY][finalX].team != piece.team){
    board[piece.pos.y][piece.pos.x] = 0;
    if(board[finalY][finalX]){
      board[finalY][finalX].remove();
    }
    piece.pos.x = finalX;
    piece.pos.y = finalY;
    board[finalY][finalX] = piece;
  }
  display_board();
}



