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
        if (msg[0] == "/mercury" && val[0] == "silence")callback("/killAll");
        
        //get the pedal+param-address of the message
        
        let pedal = msg[0].split("/")[1];
        let param = msg[0].split("/")[2];
        let extra = (param == "sample" || param == "createSeq")?param:msg[0].split("/")[3];
        let value = (val.length == 1) ? val[0] : val;
        let last = val[val.length - 1];
        let addr = pedal + "/" + param;
                
        if (extra == "fade" || extra == "oscillate") {
          this.stop[addr] = 0;
        }

        //check if any hold-function (once || change) should be switched off
        if (!this.appendix.includes(last)) this.state[addr] = 0;
        if (last == "change" && this.value[addr] != value[0]) {
          this.state[addr] = 0;
        }
        if (last == "cont" && (extra == "fade" || extra == "sample")) {
          this.state[addr] = 0;
        }

        //if no hold function, return the incoming OSC-data. 
        if (!this.state[addr] && extra != "stop") {
          (val.length == 4 && extra == "ramp") ? val.push(50) : null;
          let returndata = {"pedal":pedal, "param":param, "extra":extra, "value":value}; 
          callback(returndata,msg);
        }
        else if (!this.stop[addr] && extra == "stop") {
          let returndata = {"pedal":pedal, "param":param, "extra":extra, "value":value};
          callback(returndata,msg);
        }

        //if the osc message asks for new or updated hold function, do so.
        if (last == "once" && (extra == "fade" || extra == "sample")) {
          this.state[addr] = 1;
        }
        if (last == "once" && extra == "oscillate") {
          this.state[addr] = 3;
        }
        if (last == "change") {
          this.state[addr] = 2;
          this.value[addr] = value[0];
        }
        if (last == "loop") {
          this.state[addr] = 4;
        }
        if (extra == "stopSample") {
          this.state[addr] = 1;
          this.state["/"+addr.split("/")[1]+"/sample"] = 0;
        }
        if (extra == "stop") {
          this.stop[addr] = 1;
        }
        if (extra == "sample") {
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
  getState() {
    console.log(this.state);
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