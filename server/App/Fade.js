class Fade {
  constructor() {
    this.fadeInfo = {};
  }
  do(pedal,param,value,callback) {
    let start,stop,time,steps,timePerStep,stepSize,stepCounter = 0;
    if (Array.isArray(value) && value.length >= 3) {
      [start,stop,time] = value;
      steps = Math.abs((stop-start))+1;
      timePerStep = time/steps;
      stepSize = (stop-start<0)?-1:1;
    }
    else {
      callback(null);
    }
    let id = pedal+"_"+param;
    (!this.fadeInfo[id])?this.fadeInfo[id] = {}:null;
    this.fadeInfo[id]['runner'] = setInterval(() => {
      if (steps === stepCounter) {
        clearInterval(this.fadeInfo[id]['runner']);
        callback({"type":"done"});
      }
      else {
        stepCounter++;
        callback({"type":"pedalData","pedal":pedal,"param":param,"value":start});
        start+=stepSize;
      }
    },timePerStep);
  }
  stopFades() {
    let keys = Object.keys(this.fadeInfo);
    keys.map(id => {
      clearInterval(this.fadeInfo[id]['runner']);
    })
  }
}

module.exports = {
  Fade: new Fade()
}