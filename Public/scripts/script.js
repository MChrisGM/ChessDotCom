let socket;
const discordRedirect = "https://discord.com/api/oauth2/authorize?client_id=831317360677355592&redirect_uri=https%3A%2F%2Fchessdotcom.mchrisgm.repl.co&response_type=code&scope=identify&prompt=none"

window.onload = function(){
  socket = io.connect(window.location.href);
  let code = parseURLParams(window.location.href) || null;
  if(code){
    code = parseURLParams(window.location.href)['code'];
    if(code){
      code = parseURLParams(window.location.href)['code'][0]
    }
  }
  if(code){
    socket.emit('validate_discord_code',code);
  }
  socket.on('discord_validation',function(user){
    console.log("Logged in to Discord as "+user.USER_NAME);
    //--------------------------------------------------------
    
  });
  
}

function discordLogin(){
  window.location.href = discordRedirect;
}

function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
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