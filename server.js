var express = require('express');
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http)
var port = 3200;

app.use(express.static('./public'))

http.listen(port,function(){
  console.log('Server started at port '+ port + '. Nodemon is running.')
})

var allUsers = []; //ovo mora biti globalna varijabla
var typing = [];

io.on('connection',(socket)=>{
  var clientId = socket.id; //ovde definises id za svaki pojedinacnu konekciju

  socket.on('new-user',(data)=>{
    var userExists = false; //stavimo da korisnik ne postoji
    for(var i = 0; i < allUsers.length; i++){
      if(allUsers[i].name == data.name){
        userExists = true; //ako postoji, onda naznacimo da postoji i javimo to klijentu.
        socket.emit('username-taken',data.name)
      }
    }

    if(!userExists){ //kada se ponovo posalje new-user, ako gornji loop ne vrati da korisnik postoji, dodaj ga u allUsers (zajedno sa id-om koji smo definisali u var clientId)
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

  //kucanje
  socket.on('user-typing',(data)=>{
    var alreadyTyping = false;
    for(var i = 0; i < typing.length; i++){
      if(typing[i] == data.userTyping){
        alreadyTyping = true;
      }
    }
    //ovo mora da se nalazi van for loopa. Da bi se jednom desilo. Zato nije u else if, je bi bilo u loop-u
    if(alreadyTyping == false){  
      typing.push(data.userTyping)
    }
    console.log(typing)
    io.emit('users-typing',typing)
  })

  socket.on('user-not-typing',(data)=>{
    for(var i = 0; i < typing.length; i++){
      if(typing[i] == data.userNotTyping){
        typing.splice(i,1)
      }
    }

    console.log(typing);
    io.emit('users-typing',typing)
  })

  socket.on('chat-message',(data)=>{
    console.log(data)
    io.emit('send-message-all',data) //io.emit salje svima
  })

})


