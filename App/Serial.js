const serial = require('serialport');

class Serial {
  constructor() {
    this.serialID = "fdasf";
  }
  connect() {
    serial.list().then(ports => {
      console.log("serial devices");
      ports.forEach(sport => {
        console.log("sn:",sport.serialNumber);
        if (sport.serialNumber != this.serialID) {
          this.port = new serial(sport.path, {
            baudRate: 115200
          }, () => {
            if (this.port) {
              this.port.on('data',data => {
                console.log(data);
              })
            }
          })
        }
      });
    });
  }
  write(data,callback) {
    if (this.port) {
      let firstByte = parseInt(data.value / 256);
      let secondByte = parseInt(data.value % 256);
      let serialMessage = [211,data.pedal,data.param,firstByte,secondByte,247];
      this.port.write(serialMessage,error => {
        if (error)console.log(error);
        callback(serialMessage);
      });
    }
  }
}

module.exports = {
  Serial: new Serial()
}