var express = require('express');
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http)
var port = 3000;

app.use(express.static('./public'))

http.listen(port,function(){
  console.log('Server started at port '+ port + '. Nodemon is running.')
})

var allUsers = []; //ovo mora biti globalna varijabla

io.on('connection',(socket)=>{

  var clientId = socket.id; //ovde definises id za svaki pojedinacnu konekciju

  socket.on('new-user',(data)=>{
    var userExists = false;
    for(var i = 0; i < allUsers.length; i++){
      if(allUsers[i].name == data.name){
        userExists = true;
        socket.emit('username-taken',data.name)
      }
    }

    if(!userExists){
      console.log('A new user joined - ' + data.name);
      allUsers.push({
        name: data.name,
        status: data.status,
        id: clientId
      }) //dodas novog usera 

      console.log(allUsers)
     io.emit('new-user-online', allUsers)
    }

    socket.on('disconnect',(socket)=>{
      console.log('Someone has disconnected', socket)
      for(var i = 0; i < allUsers.length; i++){
        if(allUsers[i].id == clientId){ //sve sto je vezano za socket vezano je za jednu konekciju
          allUsers.splice(i,1) //obrisi ovaj, pa posalji celu listu
          io.emit('new-user-online', allUsers)
        }
      }
    })
  })

  // allUsers.forEach --> on disconnect

  socket.on('chat-message',(data)=>{
    console.log(data)
    io.emit('send-message-all',data)
  })

})


