const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  pingTimeout: 60000,
});

class Server{
  start() {
    server.listen(8001,() => {
      console.log("aan!");
    });
    app.use(express.static(path.join(__dirname,'/..')));
    app.use((req,res,next) => {
      let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      res.status(400).send("kannievinden...")
    });
  }
  socket(callback) {
    io.on('connection',socket => {
      this.client = socket;
      console.log("connection!");
      callback();
    });
  }
  send(data) {
    if (this.client) {
      this.client.emit(data.address,data.value);  
    }
  }
  receive(callback) {
    if (this.client) {
      this.client.on('message',data => {
        callback(data);
      })  
    }
    
  }
}

module.exports = {
  Server: new Server()
}