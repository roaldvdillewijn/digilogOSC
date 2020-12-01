const Oscillate = require('./Oscillate').Oscillate;
const Fade = require('./Fade').Fade;
const CreateSeq = require('./CreateSeq').CreateSeq;
const Sample = require('./Sample').Sample;

class ExtraPedalFunctions {
  catchExtras(data,callback) {
    if (data.extra == "sample") {
      switch(data.pedal) {
        case "volante":
          Sample.volante(data.value,returndata => {
            callback(returndata);
          });
        break;
        case "looper": 
          Sample.looper(...data.value,returndata => {
            callback(returndata);
          });
        break;
        case "canyon":
          Sample.canyon(data.value,returndata => {
            callback(returndata);
          });
        break;
        case "tensor":
          Sample.tensor(data.value,returndata => {
            callback(returndata);
          });
        break;
      }
    }
    if (data.extra == "stopSample") {
      switch(data.pedal) {
        case "volante":
          Sample.stopVolante(returndata => {
            callback(returndata);
          });
        break;
        case "looper":
          Sample.stopLooper(returndata => {
            callback(returndata);
          })
        break;
        case "canyon":
          Sample.stopCanyon(returndata => {
            callback(returndata);
          });
        break;
        case "tensor":
          Sample.stopTensor(returndata => {
            callback(returndata);
          });
        break;
      }
    }
    if (data.extra == "oscillate") {
      Oscillate.do(data.pedal,data.param,data.value,returndata => {
        callback(returndata);  
      });
    }
    else if (data.extra == "stop") {
      Oscillate.stop(data.pedal,data.param,data.value,returndata => {
        callback({"type":"done","pedal":data.pedal,"param":Array.isArray(data.value)?data.value[0]:data.value});
      });
    }
    else if (data.extra == "fade") {
      Fade.do(data.pedal,data.param,data.value,returndata => {
        if (returndata.type == "done" && (data.extra == "fade" || data.extra == "stop")) {
          callback({"type":"done","pedal":data.pedal,"param":Array.isArray(data.value)?data.value[0]:data.value});
        }
        else {
          callback(returndata);  
        }
      });
    }
    else if (data.extra == "createSeq") {
      CreateSeq.do(data.pedal,data.value,returndata => {
        callback(returndata);
      })
    }
  }
  stopExtras() {
    Oscillate.stopOscillators();
    Fade.stopFades();
  }
}

module.exports = {
  ExtraPedalFunctions: new ExtraPedalFunctions()
}