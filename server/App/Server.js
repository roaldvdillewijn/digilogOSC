const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  pingTimeout: 60000,
});

class Server{
  constructor() {
    this.client = {};
    
  }
  start() {
    server.listen(3001,() => {
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
      this.client[socket.id] = socket;
      console.log("connection!",socket.id);
      callback();
    });
  }

  send(data) {
    let keys = Object.keys(this.client);
    keys.map((id,index) => {
      if (this.client[id]) {
        this.client[id].emit(data.address,data.value);  
      }
    });
  }
  
  receive(callback) {
    let keys = Object.keys(this.client);
    keys.map((id,index) => {
      if (this.client[id]) {
        this.client[id].on('message',data => {
          callback(data);
        })  
      }
    })
  }
}

module.exports = {
  Server: new Server()
}