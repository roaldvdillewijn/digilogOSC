class Fade {
  do(pedal,value,callback) {
    let param,start,stop,time,steps,timePerStep,stepSize,stepCounter = 0;
    if (Array.isArray(value) && value.length >= 4) {
      [param,start,stop,time] = value;
      steps = Math.abs((stop-start))+1;
      timePerStep = time/steps;
      stepSize = (stop-start<0)?-1:1;
    }
    else {
      callback(null);
    }
    let runner = setInterval(() => {
      if (steps === stepCounter) {
        clearInterval(runner);
        callback({"type":"done"});
      }
      else {
        stepCounter++;
        callback({"type":"pedalData","pedal":pedal,"param":param,"value":start});
        start+=stepSize;
      }
    },timePerStep);
  }
}

module.exports = {
  Fade: new Fade()
}