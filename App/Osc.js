const osc = require('node-osc');

class Osc {
  constructor() {
    this.state = {};
  }
  createServer() {
    this.server = new osc.Server(9000,'0.0.0.0');
  }
  handleData(callback) {
    if (this.server) {
      this.server.on("message",(msg,rinfo) => {
        let val = [...msg];
        val.shift();
        let addr = msg[0]
        if (msg[0].split("/")[2] == "fade") {
          addr = "/"+msg[0].split("/")[1]+"/"+val[0];
        }
        if (val[val.length -1] == "resume") {
          this.state[addr] = 0;
        }
        if (!this.state[addr]) {
          (val.length == 4 && msg[0].split("/")[2] == "ramp")?val.push(50):null;
          let returndata = {"pedal":0,"param":0,"value":(val.length==1)?val[0]:val};
          returndata.pedal = msg[0].split("/")[1];
          returndata.param = msg[0].split("/")[2];
          callback(returndata,msg);
        }
        if (val[val.length - 1] == "once") {
          this.state[addr] = 1;
        }
      });
    }
  }
  createClient() {
    this.client = new osc.Client('127.0.0.1',9001);
  }
  send(data) {
    if (this.client) {
      this.client.send(data.address,data.message,() => {

      })
    }
  }
}

module.exports = {
  Osc: new Osc()
}