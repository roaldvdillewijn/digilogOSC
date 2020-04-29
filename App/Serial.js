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
              console.log("listening...");
              this.port.on('data',data => {
                if (data[0] == 129 && data[2] == 250) {
                  for (let j=0;j<(data.length/3);j++) {
                    if (data[(j*3)] == 129 && data[(j*3)+2] == 250) {
                      console.log(data[(j*3)+1]);
                    }
                  }
                }
              })
            }
          })
        }
      });
    });
  }
  checkPedals() {
    if (this.port) {
      let serialMessage = [255, 0, 254, 1, 253, 2];
      this.port.write(serialMessage)
    }
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
        let value = Array.isArray(data.value)?data.value[0]:data.value;
        let firstByte = Math.abs(parseInt(value / 256));
        let secondByte = Math.abs(parseInt(value % 256));
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