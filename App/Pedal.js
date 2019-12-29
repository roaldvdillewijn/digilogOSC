const pedals = require('../assets/pedals.json');

class Pedal {
  constructor() {
    this.effects = [];
  }
  getPedals() {
    for (let i in pedals) {
      this.effects.push(pedals[i]);
    }
  }
  getPedalInfo(data,callback) {
    let arr = [];
    this.effects.map(pedal => {
      if (pedal.id == data.value) {
        for (let i in pedal.param) {
          let min,max;
          if (pedal.param[i].type == "select") {
            min = 0;
            max = pedal.param[i].menuItems.length;
          }
          else {
            min = pedal.param[i].min;
            max = pedal.param[i].max;
          }
          if (pedal.param[i].type != "hidden") {
            arr.push({
              "id":{"text":i,"type":null},
              "param":{"text":pedal.param[i].name,"type":"text"},
              "osc":{"text":"/"+pedal.id+"/"+i,"type":"text"},
              "min":{"text":min,"type":"text"},
              "max":{"text":max,"type":"text"},
              // "change":{"text":"change","type":"button","direction":[pedal.number,pedal.param[i].number]}
            });
          }
        }
      }
    })
    callback(arr);
  }
  getOnlinePedals(callback) {
    let arr = [];
    this.effects.map(pedal => {
      if (pedal.online == 1) {
        arr.push({
          "pedal":{"text":pedal.name,"type":"text"},
          "online":{"text":pedal.type,"type":"text"},
          "options":{"text":"info","type":"button","direction":[pedal.id,pedal.name]}
        });  
      }
    }) 
    callback(arr);
  }
  getPedalData(pedal,param,value,callback) {
    let returndata = {"pedal":0,"param":0,"value":value}
    this.effects.forEach(pdl => { 
      if (pdl.id == pedal) {
        returndata.pedal = pdl.number;
        for (let prm in pdl.param) {
          if (prm == param) {
            returndata.param = pdl.param[prm].number;
            callback(returndata);
          }
        }
      }
    });
  }
}

module.exports = { 
  Pedal: new Pedal()
}