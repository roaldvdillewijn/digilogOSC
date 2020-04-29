
const Osc = require('./App/Osc').Osc;
const Serial = require('./App/Serial').Serial;
const Pedal = require('./App/Pedal').Pedal;
const Server = require('./App/Server').Server;
const Midi = require('./App/Midi').Midi;
const midiList = {};


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

Pedal.getPedals(() => {
  Pedal.getMidiPedals(res => {
    res.map((result,index) => {
      midiList[result.pedal] = new Midi(result);
      midiList[result.pedal].connect(() => {
        //something with receiving midi-data;
      });  
    })
  });
  console.log("midiList:",midiList);
});

Osc.handleData((msg,raw) => {
  if (msg == "/checkPedals") {
    Serial.checkPedals();
  }
  else {
    Server.send({address:'oscData',value:raw})
    Pedal.catchExtras(msg,data => {
      if (data) {
        if (data.done == 1) {
          Osc.setState("/"+data.pedal+"/"+data.param);
        }
        else if (data.midi == 1) {
          midiList[data.id].write(data,(midiData => {
            Server.send({address:"serialData",value:midiData});
          }));
        }
        else {
          Serial.write(data,(serialData => {
            Server.send({address:"serialData",value:serialData});
          }))
        }
      }
    });
    Pedal.getPedalData(msg,data => {
      if (data) {
        Pedal.setValue(data);
        if (data.midi == 1) {
          midiList[data.id].write(data,(midiData => {
            Server.send({address:"serialData",value:midiData});
          }));
        }
        else if (data.midi == 2) {
          midiList[data.id].writeLSB(data,midiData => {
            Server.send({address:"serialData",value:midiData});
          })
        }
        else {
          Serial.write(data,(serialData => {
            Server.send({address:"serialData",value:serialData});
          }));
        }
      }
    })
  }
});


