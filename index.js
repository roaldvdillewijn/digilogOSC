
const Osc = require('./App/Osc').Osc;
const Serial = require('./App/Serial').Serial;
const Pedal = require('./App/Pedal').Pedal;
const Server = require('./App/Server').Server;
const Midi = require('./App/Midi').Midi;
const ExtraPedalFunctions = require('./App/ExtraPedalFunctions').ExtraPedalFunctions;
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
});

Osc.handleData((msg,raw) => {
  if (msg == "/checkPedals") {
    Serial.checkPedals();
  }
  else {
    Server.send({address:'oscData',value:raw})
    ExtraPedalFunctions.catchExtras(msg,returndata => {
      if (returndata) {
        if (returndata.type === "done") {
          Osc.setState("/"+returndata.pedal+"/"+returndata.param);
        }
        else{
          handlePedalData(returndata);
        }
      }
    });
    handlePedalData(msg);
  }
});

function handlePedalData(pedalData) {
  Pedal.getPedalData(pedalData,data => {
    if (data) {
      Pedal.setValue(data);
      if (data.midi) {
        midiList[data.id].write(data,Server);
      }
      else {
        Serial.write(data,Server);
      }
    }
  })
}

