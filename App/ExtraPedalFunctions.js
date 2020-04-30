const Oscillate = require('./Oscillate').Oscillate;
const Fade = require('./Fade').Fade;
const CreateSeq = require('./CreateSeq').CreateSeq;

class ExtraPedalFunctions {
  catchExtras(data,callback) {
    if (data.param == "oscillate") {
      Oscillate.do(data.pedal,data.value,returndata => {
        callback(returndata);  
      });
    }
    else if (data.param == "stop") {
      Oscillate.stop(data.pedal,data.value,returndata => {
        callback({"type":"done","pedal":data.pedal,"param":Array.isArray(data.value)?data.value[0]:data.value});
      });
    }
    else if (data.param == "fade") {
      Fade.do(data.pedal,data.value,returndata => {
        if (returndata.type == "done" && (data.param == "fade" || data.param == "stop")) {
          callback({"type":"done","pedal":data.pedal,"param":Array.isArray(data.value)?data.value[0]:data.value});
        }
        else {
          callback(returndata);  
        }
      });
    }
    else if (data.param = "createSeq") {
      CreateSeq.do(data.pedal,data.value,returndata => {
        callback(returndata);
      })
    }
  }
}

module.exports = {
  ExtraPedalFunctions: new ExtraPedalFunctions()
}