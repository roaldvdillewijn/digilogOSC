const serial = require('serialport');

class Serial {
  constructor() {
    this.serialID = "1978490";
  }
  connect() {
    serial.list().then(ports => {
      console.log("serial devices");
      ports.forEach(sport => {
        console.log("sn:",sport.serialNumber);
        if (sport.serialNumber == this.serialID) {
          this.port = new serial(sport.path, {
            baudRate: 115200
          }, () => {
            console.log("connected to serial");
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
      if (data.ramp == 1) {
        let messageList = [];
        data.value.map((val,index) => {
          let firstByte = Math.abs(parseInt(val / 256));
          let secondByte = Math.abs(parseInt(val % 256));
          let serialMessage = [211,data.pedal,data.param[index],firstByte,secondByte,247];
          this.port.write(serialMessage,error => {
            console.log(serialMessage);
            if (error)console.log(error);
            messageList.push(serialMessage);
          })
        })
        callback(messageList);
      }
      else {
        let firstByte = Math.abs(parseInt(data.value / 256));
        let secondByte = Math.abs(parseInt(data.value % 256));
        let serialMessage = [211,data.pedal,data.param,firstByte,secondByte,247];
        this.port.write(serialMessage,error => {
          console.log(serialMessage);
          if (error)console.log(error);
          callback(serialMessage);
        });
      }
    }
  }
}

module.exports = {
  Serial: new Serial()
}