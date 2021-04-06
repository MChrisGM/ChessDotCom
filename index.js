let express = require('express');
let app = express();

let server = app.listen(process.env.PORT || 3000, listen);

app.use(express.static('Public'));

let io = require('socket.io')(server);

let players = {};
let lobbies = {};

function listen() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Started server at https://' + host + ':' + port);

  setInterval(function() {
    printPlayers();
  }, 10000);
}

io.sockets.on('connection',
  function(socket) {

    // console.log("New user with id: " + socket.id);

    let pID = Math.random();
    players[pID] = {
      id: pID,
      name: "Guest_" + Math.floor(Math.random() * 1000),
      lobby: null,
      server: null,
    };
    socket.emit('setPlayerId', pID);


    //-----------------------------------------------------------Repeat Message---------------------------------------------------------------------
    socket.on('sendMessage', function(data) {
      data.time = Date.now();
      io.in(players[pID].lobby).emit('receiveMessage', data);
    });

    //-----------------------------------------------------------Update position---------------------------------------------------------------------
    socket.on('updatePosition', function(data) {
      if (Object.keys(players).length > 0) {
        players[pID].position = data;
      }
    });


    //-----------------------------------------------------------Set Username---------------------------------------------------------------------
    socket.on('username', function(username) {
      if (username.length <= 20) {
        if (!(bannedUnames.includes(username))) {
          players[pID].name = escape(username);
        } else {
          players[pID].name = "Guest_" + Math.floor(Math.random() * 1000);
          socket.emit('clearUsername', null);
        }
      } else {
        username = username.substring(0, username.length - (username.length - 20));
        socket.emit('clearUsername', username);
      }
    });


    //-----------------------------------------------------------Create Custom Lobby---------------------------------------------------------------------
    socket.on('createCustom', function(data) {
      let lobby = createLobby(true);
      if (!(lobbies[lobby].players.includes(pID))) {
        lobbies[lobby].players.push(pID);
      }
      players[pID].lobby = lobbies[lobby].code;
      socket.join(players[pID].lobby);
      socket.emit('joinLobby', players[pID].lobby);
    });


    //-----------------------------------------------------------Join Custom Lobby---------------------------------------------------------------------
    socket.on('joinCustom', function(data) {
      if (lobbyExists(data)) {
        if (lobbyAvailable(data)) {
          if (!(lobbies[data].players.includes(pID))) {
            lobbies[data].players.push(pID);
          }
          players[pID].lobby = lobbies[data].code;
          socket.join(players[pID].lobby);
          socket.emit('joinLobby', players[pID].lobby);
        }
      }
    });


    //-----------------------------------------------------------Join Random Lobby---------------------------------------------------------------------
    socket.on('joinRandom', function(data) {
      joinLobby(pID);
      socket.join(players[pID].lobby);
      socket.emit('joinLobby', players[pID].lobby);
    });


    //-----------------------------------------------------------Send lobby info---------------------------------------------------------------------
    socket.on('lobbyInfo', function(data) {
      let playerInfo = {
        ids: [],
        names: [],
        positions: []
      };
      if (Object.keys(lobbies).length > 0 && lobbies[players[pID].lobby]) {
        for (let player of lobbies[players[pID].lobby].players) {
          playerInfo.ids.push(players[player].id);
          playerInfo.names.push(players[player].name);
          playerInfo.positions.push(players[player].position);
        }
        // console.log(playerNames);
        io.in(players[pID].lobby).emit('lobbyInfo', playerInfo);
      }
    });


    //-----------------------------------------------------------On disconnect---------------------------------------------------------------------
    socket.on('disconnect', function() {
      if (players[pID].lobby != null) {
        let lobbyCode = players[pID].lobby;
        const index = lobbies[lobbyCode].players.indexOf(pID);
        if (index > -1) {
          lobbies[lobbyCode].players.splice(index, 1);
          if (lobbies[lobbyCode].players.length < 1) {
            delete lobbies[lobbyCode];
          } else {

            let playerNames = [];
            for (let player of lobbies[lobbyCode].players) {
              if (player != players[pID]) {
                playerNames.push(players[player].name);
              }
            }
            io.in(players[pID].lobby).emit('lobbyInfo', playerNames);

          }
        }
      }
      delete players[pID];
    });
  }
);



//-----------------------------------------------------------Check lobby availability---------------------------------------------------------------------
function lobbyAvailable(lobbyid) {
  for (const [key, value] of Object.entries(lobbies)) {
    if (key == lobbyid) {
      if (lobbies[key].players.length < 10) {
        return true;
      }
    }
  }
  return false;
}

function lobbyExists(lobbyid) {
  let exists = false;
  for (const [key, value] of Object.entries(lobbies)) {
    if (key == lobbyid) {
      exists = true;
    }
  }
  return exists;
}


//-----------------------------------------------------------Display info---------------------------------------------------------------------
function printPlayers() {
  let pla = JSON.stringify(players).substring(1);
  pla = pla.substring(0, pla.length - 2);
  let result = [];
  console.log('---------------------------------');
  // console.log();
  let tmp = pla.split("},");
  tmp.forEach(function(x) { result.push(x.replace(",", ", ") + "}"); });
  console.warn(result.join('\n'));
  console.log();

  console.log(lobbies);

  // console.log();
  console.log('---------------------------------');
  console.log();
}


//-----------------------------------------------------------Create Lobby---------------------------------------------------------------------
let defaultSettings = {
  private: false,
};

function createLobby(private) {
  let lobbyCode = randomString(5, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  let LobbySettings = JSON.parse(JSON.stringify(defaultSettings));
  lobbies[lobbyCode] = {
    code: lobbyCode,
    players: [],
    settings: LobbySettings
  };
  if (private) {
    lobbies[lobbyCode].settings.private = true;
  } else {
    lobbies[lobbyCode].settings.private = false;
  }
  console.log(defaultSettings);
  return lobbyCode;
}


//-----------------------------------------------------------Join lobby---------------------------------------------------------------------
function joinLobby(pID) {
  if (Object.keys(lobbies).length < 1) {
    createLobby(false);
  }
  let joined = false;
  for (const [key, value] of Object.entries(lobbies)) {
    // console.log(`${key}: ${value}`);
    if (lobbies[key].players.length < 10 && lobbies[key].settings.private != true) {
      if (!(lobbies[key].players.includes(pID))) {
        lobbies[key].players.push(pID);
      }
      players[pID].lobby = lobbies[key].code;
      joined = true;
      // console.log(lobbies[key].players);
      return;
    }
  }
  if (!joined) {
    createLobby(false);
    joinLobby(pID);
  }
  return;
}


//-----------------------------------------------------------Create Lobby code---------------------------------------------------------------------
function randomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
