const midi = require('midi');

class Midi {
  constructor(data) {
    this.portName = data.midiName || null;
    this.channel = data.number || null;
    this.inout = 'out';
    this.port = new midi.output();
    this.portNumber = -1;
    this.handler;
    this.connected = 0;
  }
  connect(callback) {
    let outputs = this.port.getPortCount();
    for (let i=0;i<outputs;i++) {
      let simplePort = this.port.getPortName(i).split(" ")[0].split(":")[0];
      if (this.portName === simplePort) {
        this.portNumber = i;
      }
    }
    if (this.portNumber == -1) {
      this.portNumber = 0;
    }
    if (this.connected) {
      this.port.closePort();
      if (this.inout == 'in') {
        this.port = new midi.input();
      }
      else if (this.inout == 'out') {
        this.port = new midi.output();
      }
    }
    this.port.openPort(this.portNumber);
    console.log("connected to",this.portName);
    this.connected = 1;
    callback();
  }
  write(data,Server) {
    if (data.midi == 1) {
      let midiMessage = [175+this.channel,data.param,data.value];
      this.port.sendMessage(midiMessage);
      Server.send({address:"serialData",value:midiMessage});  
    }
    else {
      let midiMessagemsb = [175+this.channel,data.param[0],data.value>>1]
      this.port.sendMessage(midiMessagemsb);
      let midiMessagelsb = [175+this.channel,data.param[1],(data.value%2)<<6]
      this.port.sendMessage(midiMessagelsb);
      Server.send({address:"serialData",value:[midiMessagemsb,midiMessagelsb]});
    }
  }
  thru(msg) {
    this.port.sendMessage(msg);
  }
  virtual(callback) {
    this.port = new midi.input();
    this.port.openVirtualPort("midibridge");
    this.port.on('message',(deltaTime,message) => {
      callback(message);
    })
  }
}

module.exports = {
  Midi: Midi
}