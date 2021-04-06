let express = require('express');
let app = express();

let server = app.listen(process.env.PORT || 3000, listen);

app.use(express.static('Lobby'));
app.use('/game',express.static('Game'));

let io = require('socket.io')(server);

let players = {};
let lobbies = {};

function listen() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Started server at https://' + host + ':' + port);

  // setInterval(function() {
  //   printPlayers();
  // }, 10000);
}

io.sockets.on('connection',
  function(socket) {
  }
);


//-----------------------------------------------------------Create Lobby code---------------------------------------------------------------------
//randomString(5, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
function randomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
