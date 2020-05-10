const pedals = require('../assets/pedals.json');

class Pedal {
  constructor() {
    this.effects = [];
    this.oscilInfo = {};
    this.extras = {
      "createSeq":this.createSeq,
      "fade":this.fade,
      "oscillate":this.oscillate,
      "stop":this.stop};
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
            let optionList = "";
            if (pedal.param[i].type == "ramp") {
              optionList += i+" ";
              for (let j in pedal.param[i].setup) {
                optionList += j + " ";
              }
            }
            else {
              optionList = i;
            }
            arr.push({
              "id":{"text":i,"type":null},
              "param":{"text":pedal.param[i].name,"type":"text"},
              "osc":{"text":"/"+pedal.id+"/"+optionList,"type":"text"},
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
    this.effects.map(pedal => {
      if (data.id === pedal.id) {
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
    const valueArray = (Array.isArray(data.value))?[...data.value]:data.value;
    let returndata = {"pedal":0,"id":"null","param":0,"value":valueArray,"midi":0,"ramp":0}
    this.effects.forEach(pdl => { 
      if (pdl.id == data.pedal) {
        if (pdl.midi)returndata.midi = 1;
        returndata.pedal = pdl.number;
        returndata.id = pdl.id;
        for (let prm in pdl.param) {
          if (prm == data.param && prm != "ramp") {
            returndata.value = (Array.isArray(returndata.value))?returndata.value[0]:returndata.value;
            if (pdl.param[prm].msblsb) {
              returndata.midi = 2;
              returndata.param = [pdl.param[prm].msb,pdl.param[prm].lsb];
            }
            else {
              returndata.param = pdl.param[prm].number;
            }
            callback(returndata);
          }
          else if (prm == data.param && prm == "ramp") {
            if (data.value.length != 5) break;
            returndata.ramp = 1;
            returndata.param = [];
            for (let i in pdl.param[prm].setup) {
              let placeHolderValue = data.value[3]
              returndata.param.push(pdl.param[prm].setup[i]);
              if (i == 'time') returndata.value[4] = placeHolderValue%256;
              if (i == 'timetwo') returndata.value[3] = parseInt(placeHolderValue/256);
              if (i == 'exp') returndata.value[5] = data.value[4];
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