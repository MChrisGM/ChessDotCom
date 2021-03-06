let socket;
const discordRedirect = "https://discord.com/api/oauth2/authorize?client_id=831317360677355592&redirect_uri=https%3A%2F%2Fchessdotcom.mchrisgm.repl.co&response_type=code&scope=identify&prompt=none"

window.onload = function(){
  socket = io.connect(window.location.origin);
  if(localStorage.getItem('user_id') != null){
    socket.emit('user_id',localStorage.getItem('user_id'));
  }else{
    localStorage.setItem('user_id',socket.id);
  }
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
    document.querySelector('#profile-name').textContent = "Logged in as "+user.USER_NAME +"#"+ user.USER_DISC;
    document.querySelector('#profile-name').style.display = 'block';
    document.querySelector('#login-button').style.display = 'none';
  });
  socket.on('invalid_id',function(){
    console.log("Invalid ID");
    localStorage.setItem('user_id',socket.id);
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