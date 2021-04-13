require("dotenv").config();
const express = require('express');
const DiscordOauth2 = require("discord-oauth2");
const MongoClient = require('mongodb').MongoClient;

let app = express();

const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.fhp5t.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();

const oauth = new DiscordOauth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

let server = app.listen(process.env.PORT || 3000, listen);

app.use(express.static('Public'));
app.use('/play',express.static('Play'));

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

    players[socket.id] = {
      id: socket.id,
      // socket: socket,
      username: "Guest",
      rating: {
        bullet: 0,
        blitz: 0,
        rapid: 0,
      },
      country: "Neverland",
      logged: false,
      discord: {
        id: "",
        username: "",
        disc: "",
        avatar: ""
      },
    };

    socket.on('user_id',function(id){
      if(players[id]){
        players[socket.id]=players[id];
        players[socket.id].logged = true;
        socket.emit('discord_validation', {
          USER_NAME: players[id].discord.username,
          USER_DISC: players[id].discord.disc,
          USER_ID: players[id].discord.id,
          USER_AVATAR: players[id].discord.avatar,
        });
      }else{
        socket.emit('invalid_id');
      }
    });

    socket.on('validate_discord_code', async function(code) {
      let user = await validateDiscord(code);
      if (user) {
        socket.emit('discord_validation', user);
        players[socket.id].username = user.USER_NAME;
        players[socket.id].logged = true;
        players[socket.id].discord = {
          id: user.USER_ID,
          username: user.USER_NAME,
          disc: user.USER_DISC,
          avatar: user.USER_AVATAR
        };

        const result = await client.db("Chess").collection("Users").findOne({
          'discord.id': players[socket.id].discord.id
        });

        if (!result) {
          await client.db("Chess").collection("Users").insertOne({
            username: players[socket.id].username,
            rating: players[socket.id].rating,
            country: players[socket.id].country,
            discord: players[socket.id].discord,
            lastLogged: new Date().getTime()
          });
        } else {
          players[socket.id] = {
            username: result.username,
            rating: result.rating,
            country: result.country,
            discord: result.discord
          }
          await client.db("Chess").collection("Users").updateOne({
            'discord.id': players[socket.id].discord.id
          }, {
              $set: {
                lastLogged: new Date().getTime()
              }
            });
        }
      }
    });

    socket.on('game_created', function() {
      console.log('game created')
    });

    socket.emit('game_listing', Object.values(lobbies));

    socket.on('disconnect', function() {
      players[socket.id].logged = false;
    });

  }
);


async function validateDiscord(code) {
  if (!code) return null;
  let result = undefined;
  try {
    result = await oauth.tokenRequest({
      code: code,
      grantType: "authorization_code",
      scope: ["identify"]
    });
  } catch {
    return null;
  }

  let user = undefined;
  try {
    user = await oauth.getUser(result.access_token);
  } catch (err) {
    console.error(err.stack);
    return null;
  }
  let data;
  if (user) {
    data = {
      USER_NAME: user.username,
      USER_DISC: user.discriminator,
      USER_ID: user.id,
      USER_AVATAR: user.avatar,
    };
  } else {
    data = null;
  }
  return data;
}




//randomString(5, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
function randomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}