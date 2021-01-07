
const Osc = require('./App/Osc').Osc;
const OscPedal = require('./App/Osc').OscPedal;
const Serial = require('./App/Serial').Serial;
const Pedal = require('./App/Pedal').Pedal;
const Server = require('./App/Server').Server;
const Files = require('./App/Files').Files;
const Midi = require('./App/Midi').Midi;
const ExtraPedalFunctions = require('./App/ExtraPedalFunctions').ExtraPedalFunctions;
const midiList = {};
let virtualMidi;

Server.start();
Server.socket(() => {
  Server.send({address:"FromAPI",value:"hallo!"})
  Server.receive(data => {
    switch(data.address) {
      case "getPedals":
        Pedal.getOnlinePedals(pedals => {
          Server.send({address:"onlinePedals",value:pedals});
        });
      break;
      case "getPedalInfo":
        Pedal.getPedalInfo(data,pedal => {
          Server.send({address:"pedalInfo",value:pedal});
        });
      break;
      case "askForOscInfo":
        Server.send({address:"oscServer",value:"Osc server listening to port 9000"})
      break;
      case "getCode":
        Files.readFile(fileData => {
          Server.send({address:"currentCode",value:fileData});
        });
      break;
      case "currentCode":
        Files.writeFile(data.value, () => {

        });
      break;
      case "getPedalOptions":
        Pedal.getPedalOptions(data.value, options => {
          Server.send({address:"pedalOptions",value:options});
        });
      break;
      case "getParamOptions":
        Pedal.getParamOptions(data.value,options => {
          Server.send({address:"paramOptions",value:options});
        });
      break;
    }
  })  
});

Serial.connect();

Osc.createServer();
Osc.createClient('127.0.0.1',9001);
OscPedal.createClient('169.254.143.3',9765);

Pedal.getPedals(res => {
  res.map((result,index) => {
    midiList[result.pedal] = new Midi(result);
    midiList[result.pedal].connect(() => {
      //something with receiving midi-data;
    });  
  });
  virtualMidi = new Midi({midiName:null,number:null});
  virtualMidi.virtual(data => {
    midiList["volante"].thru(data)
  });
});

Osc.handleData((msg,raw) => {
  console.log(msg);
  if (msg == "/checkPedals") {
    Serial.checkPedals();
  }
  if (msg == "/killAll") {
    //turn of all pedals that are on:
    Pedal.turnAllOff(data => {
      sendPedalData(data);
    });
    //check running oscillators, fades etc. and stop them
    ExtraPedalFunctions.stopExtras();
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

function sendPedalData(data) {
  if (data) {
    Pedal.setValue(data);
    if (data.midi) {
      midiList[data.id].write(data,Server);
    }
    else {
      // Serial.write(data,Server);
      let value = Array.isArray(data.value)?data.value[0]:data.value;
      let oscMessage = [data.pedal,data.param,value];
      OscPedal.send({address:"/data",message:oscMessage});
      //hier moet dan iets komen dat het via OSC-verzonden wordt naar de digilog-osc-dinges
    }
  }
}

function handlePedalData(pedalData) {
  Pedal.getPedalData(pedalData,data => {
    sendPedalData(data);
  })
}

