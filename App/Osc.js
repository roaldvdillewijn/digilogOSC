const osc = require('node-osc');

class Osc {
  createServer() {
    this.server = new osc.Server(9000,'0.0.0.0');
  }
  handleData(callback) {
    if (this.server) {
      this.server.on("message",(msg,rinfo) => {
        let returndata = {"pedal":0,"param":0,"value":msg[1]};
        returndata.pedal = msg[0].split("/")[1];
        returndata.param = msg[0].split("/")[2];
        callback(returndata);
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