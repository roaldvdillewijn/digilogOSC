const osc = require('node-osc');

class Osc {
  constructor() {
    this.state = {};
    this.stop = {};
    this.value = {};
    this.funcs = ["fade","oscillate","stop"];
  }
  createServer() {
    this.server = new osc.Server(9000,'0.0.0.0');
  }
  handleData(callback) {
    if (this.server) {
      this.server.on("message",(msg,rinfo) => {      
        let val = [...msg];
        val.shift();
        if (msg[0] == "/checkPedals")callback("/checkPedals");
        
        //get the pedal+param-address of the message
        let addr = msg[0];
        let value = (val.length == 1) ? val[0] : val;
        let func = msg[0].split("/")[2];
        if (this.funcs.includes(func)) {
          addr = "/" + msg[0].split("/")[1] + "/" + val[0];
        }
        
        if (func == "fade" || func == "oscillate") {
          this.stop[addr] = 0;
        }

        //check if any hold-function (once || change) should be switched off
        if (val[val.length - 1] != "once" && val[val.length - 1] != "change" && val[val.length - 1] != "loop" && val[val.length - 1] != "cont") {
          this.state[addr] = 0;
        }
        if (val[val.length - 1] == "change" && this.value[addr] != value[0]) {
          this.state[addr] = 0;
        }
        if (val[val.length - 1] == "cont" && func == "fade") {
          this.state[addr] = 0;
        }

        //if no hold function, return the incoming OSC-data. 
        if (!this.state[addr] && func != "stop") {
          (val.length == 4 && msg[0].split("/")[2] == "ramp") ? val.push(50) : null;
          let returndata = {"pedal":0, "param":0, "value":value};
          returndata.pedal = msg[0].split("/")[1];
          returndata.param = msg[0].split("/")[2];
          callback(returndata,msg);
        }
        else if (!this.stop[addr] && func == "stop") {
          let returndata = {"pedal":0, "param":0, "value":value};
          returndata.pedal = msg[0].split("/")[1];
          returndata.param = msg[0].split("/")[2];
          callback(returndata,msg);
        }

        //if the osc message asks for new or updated hold function, do so.
        if (val[val.length - 1] == "once" && func == "fade") {
          this.state[addr] = 1;
        }
        if (val[val.length - 1] == "once" && func == "oscillate") {
          this.state[addr] = 3;
        }
        if (val[val.length - 1] == "change") {
          this.state[addr] = 2;
          this.value[addr] = value[0];
        }
        if (val[val.length - 1] == "loop") {
          this.state[addr] = 4;
        }
        if (func == "stop") {
          this.stop[addr] = 1;
        }
      });
    }
  }
  setState(id) {
    if (this.state[id] == 3 || this.state[id] == 4) {
      this.state[id] = 0;  
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