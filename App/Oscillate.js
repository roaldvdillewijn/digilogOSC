class Oscillate {
  constructor() {
    this.oscilInfo = {};
  }
  do(pedal,value,callback) {
    let param,low,high,time,steps,timePerStep,stepSize,objaddr,stepCounter = 0;
    if (Array.isArray(value) && value.length >= 4) {
      [param,low,high,time] = value;
      steps = Math.abs((high-low));
      timePerStep = (time/2)/steps;
      stepSize = 1;
      objaddr = pedal+"_"+param;
    }
    else {
      callback(null);
    }
    
    if (!this.oscilInfo[objaddr])this.oscilInfo[objaddr] = {};

    if (this.oscilInfo[objaddr].lastValue) {
      low = this.oscilInfo[objaddr].lastValue;
      if (this.oscilInfo[objaddr].lastValue == high) {
        stepSize -1;
      }
      else {
        stepCounter = low;
      }
    }
    
    this.oscilInfo[objaddr]['runner'] = setInterval(() => {
      if (steps === stepCounter) {
        if(this.oscilInfo[objaddr]['stop'] == stepSize) {
          this.stopIt(objaddr,low,() => {
            callback({"type":"done"});
          });
        }
        else {
          stepSize *= -1;
          stepCounter = 0;  
        }
      }
      else {
        if (this.oscilInfo[objaddr]['stop'] == 2) {
          this.stopIt(objaddr,low,() => {
            callback({"type":"done"});
          });
        }
        stepCounter++;
        callback({"type":"pedalData","pedal":pedal,"param":param,"value":low})
        low += stepSize;
      }
    },timePerStep);
  }
  stopIt(objaddr,low,callback) {
    clearInterval(this.oscilInfo[objaddr]['runner']);
    this.oscilInfo[objaddr]['lastValue'] = low;
    this.oscilInfo[objaddr]['stop'] = 0;
    callback();
  }
  stop(pedal,value,callback) {
    let param = Array.isArray(value)?value[0]:value
    if (this.oscilInfo[pedal+"_"+param]) {
      if (Array.isArray(value)) {
        if (value[1] == 'up') {
          this.oscilInfo[pedal+"_"+param]['stop'] = 1;
        }
        if (value[1] == 'down') {
          this.oscilInfo[pedal+"_"+param]['stop'] = -1;
        }
      }
      else {
        this.oscilInfo[pedal+"_"+param]['stop'] = 2;
      }
    }
  }
}

module.exports = {
  Oscillate: new Oscillate()
}