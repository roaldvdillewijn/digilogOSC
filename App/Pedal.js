const pedals = require('../assets/pedals.json');

class Pedal {
  constructor() {
    this.effects = [];
  }
  getPedals(callback) {
    for (let i in pedals) {
      this.effects.push(pedals[i]);
    }
    callback()
  }
  getPedalInfo(data,callback) {
    let arr = [];
    this.effects.map(pedal => {
      if (pedal.id === data.value) {
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
              "value":{"text":pedal.param[i].value,"type":"text"},
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

  getMidiPedals(callback) {
    let arr = []
    this.effects.map(pedal => {
      if (pedal.online === 1 && pedal.midi === 1) {
        arr.push({
          "pedal":pedal.id,
          "midiName":pedal.midiName,
          "number":pedal.number
        });
      }
    });
    callback(arr);
  }
  getOnlinePedals(callback) {
    let arr = [];
    this.effects.map(pedal => {
      if (pedal.online === 1) {
        arr.push({
          "pedal":{"text":pedal.name,"type":"text"},
          "online":{"text":pedal.type,"type":"text"},
          "options":{"text":"info","type":"button","direction":[pedal.id,pedal.name]}
        });  
      }
    }) 
    callback(arr);
  }
  setValue(data) {
    console.log(data);
    this.effects.map(pedal => {
      if (data.pedal === pedal.id) {
        for (let i in pedal.param) {
          if (data.midi == 2) {
            if (pedal.msb == data.param[0] && pedal.lsb == data.param[1]) {
              pedal.param[i].value = data.value;
            }
          }
          else {
            if (pedal.param[i].number == data.param) {
              pedal.param[i].value = data.value;
            }  
          }
        }
      }
    })
  }
  getPedalData(data,callback) {
    let returndata = {"pedal":0,"param":0,"value":data.value,"midi":0}
    this.effects.forEach(pdl => { 
      if (pdl.id == data.pedal) {
        if (pdl.midi)returndata.midi = 1;
        returndata.pedal = pdl.id;
        for (let prm in pdl.param) {
          if (prm == data.param) {
            if (pdl.param[prm].msblsb) {
              returndata.midi = 2;
              returndata.param = [pdl.param[prm].msb,pdl.param[prm].lsb];
            }
            else {
              returndata.param = pdl.param[prm].number;
            }
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