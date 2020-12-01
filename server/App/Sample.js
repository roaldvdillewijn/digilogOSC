class Sample {
  
  constructor() {
    this.pedal = null;
  }
  scale(a,b,c,d,e) {
    let value = parseInt(a - b) / parseInt(c - b) * parseInt(e - d) + parseInt(d);
    return value;
  }
  setPedal(pedal) {
    this.pedal = pedal;
  }
  setPedalData(param,value) {
    return {"type":"pedalData","pedal":this.pedal,"param":param,"value":value}  
  }
  wait(param,value,time) {
    let promise = new Promise((resolve,reject) => {
      setTimeout(()=>{
        resolve(this.setPedalData(param,value));
      },time)
    })
    return promise;
  }

  //functions for the pedals
  stopVolante(callback) {
    this.setPedal("volante");
    callback(this.setPedalData("hold",0));
    callback(this.setPedalData("sos",0));
    callback(this.setPedalData("state",0));
  }
  volante(speed,callback) {
    let sp = (speed.length > 1)?speed[0]:speed;
    this.setPedal("volante");
    if (sp > 16000 && sp < 32000) callback(this.setPedalData("speed",3));
    if (sp > 32000) callback(this.setPedalData("speed",1));
    callback(this.setPedalData("state",127));
    callback(this.setPedalData("sos",1));
    callback(this.setPedalData("tap",1));
    this.wait("tap",0,50).then(done => {
      callback(done);
    });
    this.wait("tap",1,sp).then(done => {
      callback(done);
      callback(this.setPedalData("hold",1));
      this.wait("tap",0,50).then(done => {
        callback(done);
      })
    });
  }
  stopLooper(callback) {
    this.setPedal("looper");
    callback(this.setPedalData("stop",1));
  }
  looper(speed,loop,callback) {
    let sp = (speed.length > 1)?speed[0]:speed;
    this.setPedal("looper");
    if (loop == "A" || loop == "a"){
      callback(this.setPedalData("loop_a",1));
      this.wait("loop_a",1,sp).then(done => {
        callback(done);
      });
    }
    if (loop == "B" || loop == "b") {
      callback(this.setPedalData("loop_b",1));
      this.wait("loop_b",1,sp).then(done => {
        callback(done);
      });
    }
  }
  stopCanyon(callback) {
    this.setPedal("canyon");
    callback(this.setPedalData("state",0));
  }
  canyon(speed,callback) {
    let sp = (speed.length > 1)?speed[0]:speed;
    sp = (sp>3000)?3000:sp;
    this.setPedal("mixer");
    callback(this.setPedalData("channel2",1));
    this.setPedal("canyon");
    callback(this.setPedalData("_mode",9));
    callback(this.setPedalData("feedback",255));
    callback(this.setPedalData("delay",this.scale(sp,0,3000,0,255)));
    callback(this.setPedalData("state",1));
    this.wait("feedback",0,sp).then(done => {
      callback(done);
      this.setPedal("mixer");
      callback(this.setPedalData("channel2",0));
    })
  }
  stopTensor(callback) {
    this.setPedal("tensor");
    callback(this.setPedalData("loopclear",0));
  }
  tensor(speed,callback) {
    let sp = (speed.length > 1)?speed[0]:speed;
    sp = (sp>4800)?4800:sp;
    this.setPedal("tensor");
    callback(this.setPedalData("speed",127));
    callback(this.setPedalData("stretch",64));
    callback(this.setPedalData("pitch",64));
    callback(this.setPedalData("blend",0));
    callback(this.setPedalData("looprec",1));
    this.wait("loopplay",1,sp).then(done => {
      callback(done);
      callback(this.setPedalData("blend",64));
    });

  }
}


module.exports = {
  Sample: new Sample()
}