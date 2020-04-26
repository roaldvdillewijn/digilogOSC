const pedals = require('../assets/pedals.json');
const scales = require('../assets/scales.json');

function rand(number) {
    let rnd = Math.floor(Math.random()*number) 
    return rnd;
  }

class Pedal {
  constructor() {
    this.effects = [];
    this.extras = {"createSeq":this.createSeq,"fadeIn":this.fadeIn};
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
  catchExtras(data,callback) {
    if (this.extras[data.param])this.extras[data.param](data.pedal,data.value,this,data => {
      callback(data);
    });
  }
  fadeIn(pedal,value,that,callback) {
    let param,start,stop,time,steps,timePerStep,stepCounter = 0;
    if (Array.isArray(value) && value.length == 4) {
      param = value[0];
      start = value[1];
      stop = value[2];
      time = value[3];
      steps = (stop-start)+1;
      timePerStep = time/steps;
    }
    else {
      callback(null);
    }
    let runner = setInterval(() => {
      if (steps === stepCounter) {
        clearInterval(runner);
      }
      else {
        stepCounter++;
        that.getPedalData({"pedal":pedal,"param":param,"value":start},data => {
          callback(data);
        });
        start++;
      }
    },timePerStep);
  }
  createSeq(pedal,value,that,callback) {
    let key, chance, valueList = [];
    const paramList = ["stepone","steptwo","stepthree","stepfour","stepfive","stepsix"]
    const pitchList = {"-12":12,"-11":16,"-10":20,"-9":24,"-8":28,"-7":32,"-6":36,"-5":40,"-4":45,"-3":49,"-2":53,"-1":57,"0":67,"1":77,"2":81,"3":86,"4":90,"5":94,"6":98,"7":102,"8":106,"9":110,"10":114,"11":118,"12":126} 
    if (Array.isArray(value)) {
      key = value[0];
      chance = value[1];
    }
    else {
      key = value;
      chance = 70;
    }
    
    for (let i=0;i<6;i++){
      if (rand(100) < chance) {
        let rnd = scales[key][Math.floor(rand(scales[key].length))]
        rnd = (rand(10) < 5)?rnd*-1:rnd;
        valueList[i] = pitchList[rnd];
      }
      else {
        valueList[i] = (rand(10)<5)?0:127;
      }
    }
    for (let i in valueList) {
      that.getPedalData({"pedal":pedal,"param":paramList[i],"value":valueList[i]},data => {
        callback(data);
      })
    }
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