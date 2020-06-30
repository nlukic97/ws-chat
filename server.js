var express = require('express');
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http)
var port = 3000;

app.use(express.static('./public'))

http.listen(port,function(){
  console.log('Server started at port '+ port + '. Nodemon is running.')
})

io.on('connection',function(socket){
  console.log('A user has connected')
  socket.on('chat-message',(data)=>{
    console.log(data)
    io.emit('send-message-all',data)
  })
})


