const midi = require('midi');

class Midi {
  constructor(data) {
    this.portName = data.midiName;
    this.channel = data.number
    this.inout = 'out';
    this.port = new midi.output();
    this.portNumber = -1;
    this.handler;
    this.connected = 0;
  }
  connect(callback) {
    let outputs = this.port.getPortCount();
    for (let i=0;i<outputs;i++) {
      if (this.portName == this.port.getPortName(i)) {
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
  write(data,callback) {
    let midiMessage = [175+this.channel,data.param,data.value];
    this.port.sendMessage(midiMessage);
    callback(midiMessage);
  }
  writeLSB(data,callback) {
    let midiMessagemsb = [175+this.channel,data.param[0],data.value>>1]
    this.port.sendMessage(midiMessagemsb);
    let midiMessagelsb = [175+this.channel,data.param[1],(data.value%2)<<6]
    this.port.sendMessage(midiMessagelsb);
    callback([midiMessagemsb,midiMessagelsb]);
  }
}

module.exports = {
  Midi: Midi
}