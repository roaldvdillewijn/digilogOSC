
const Osc = require('./App/Osc').Osc;
const Serial = require('./App/Serial').Serial;
const Pedal = require('./App/Pedal').Pedal;
const Server = require('./App/Server').Server;


Server.start();
Server.socket(() => {
  Server.receive(data => {
    switch(data.address) {
      case "getPedals":
      Pedal.getOnlinePedals(pedals => {
        pedals.map(pedal => {
          Server.send({address:"onlinePedals",value:pedal});          
        });
      });
      break;
      case "getPedalInfo":
        Pedal.getPedalInfo(data,pedal => {
          pedal.map(param => {
            Server.send({address:"pedalInfo",value:param});  
          });
        });
      break;
      case "askForOscInfo":
        Server.send({address:"oscServer",value:"Osc server listening to port 9000"})
      break;
    }
  })  
});

Serial.connect();

Osc.createServer();
Osc.createClient();

Pedal.getPedals();

Osc.handleData((msg,raw) => {
  Server.send({address:'oscData',value:raw})
  Pedal.getPedalData(msg,data => {
    Serial.write(data,(serialData => {
      Server.send({address:"serialData",value:serialData});
    }));
  })
});


