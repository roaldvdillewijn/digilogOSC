const osc = require('node-osc');

class Osc {
  constructor() {
    this.state = {};
    this.stop = {};
    this.value = {};
    this.funcs = ["fade","oscillate","stop"];
    this.appendix = ["once","change","loop","cont"];
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
        
        let pedal = msg[0].split("/")[1];
        let param = msg[0].split("/")[2];
        let value = (val.length == 1) ? val[0] : val;
        let last = val[val.length -1];
        let addr = (this.funcs.includes(param))?"/" + pedal + "/" + val[0]:msg[0];
                
        if (param == "fade" || param == "oscillate") {
          this.stop[addr] = 0;
        }

        //check if any hold-function (once || change) should be switched off
        if (!this.appendix.includes(last)) this.state[addr] = 0;
        if (last == "change" && this.value[addr] != value[0]) {
          this.state[addr] = 0;
        }
        if (last == "cont" && (param == "fade" || param == "sample")) {
          this.state[addr] = 0;
        }

        console.log(this.state[addr],addr);
        //if no hold function, return the incoming OSC-data. 
        if (!this.state[addr] && param != "stop") {
          (val.length == 4 && param == "ramp") ? val.push(50) : null;
          let returndata = {"pedal":pedal, "param":param, "value":value}; 
          callback(returndata,msg);
        }
        else if (!this.stop[addr] && param == "stop") {
          let returndata = {"pedal":pedal, "param":param, "value":value};
          callback(returndata,msg);
        }

        //if the osc message asks for new or updated hold function, do so.
        if (last == "once" && (param == "fade" || param == "sample")) {
          this.state[addr] = 1;
        }
        if (last == "once" && param == "oscillate") {
          this.state[addr] = 3;
        }
        if (last == "change") {
          this.state[addr] = 2;
          this.value[addr] = value[0];
        }
        if (last == "loop") {
          this.state[addr] = 4;
        }
        if (param == "stopSample") {
          this.state[addr] = 1;
          this.state["/"+addr.split("/")[1]+"/sample"] = 0;
        }
        if (param == "stop") {
          this.stop[addr] = 1;
        }
        if (param == "sample") {
          this.state["/"+addr.split("/")[1]+"stopSample"] = 0;
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