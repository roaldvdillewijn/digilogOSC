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
    callback(this.setPedalData("sos",0));
    callback(this.setPedalData("_bypass",0));
  }
  volante(speed,callback) {
    this.setPedal("volante");
    callback(this.setPedalData("_bypass",1));
    callback(this.setPedalData("sos",1));
    callback(this.setPedalData("tap",1));
    this.wait("tap",0,50).then(done => {
      callback(done);
    });
    this.wait("tap",1,speed).then(done => {
      callback(done);
      callback(this.setPedalData("hold",0));
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
    this.setPedal("looper");
    if (loop == "A" || loop == "a"){
      callback(this.setPedalData("lpa",1));
      this.wait("lpa",1,speed).then(done => {
        callback(done);
      });
    }
    if (loop == "B" || loop == "b") {
      callback(this.setPedalData("lpb",1));
      this.wait("lpb",1,speed).then(done => {
        callback(done);
      });
    }
  }
  stopCanyon(callback) {
    this.setPedal("canyon");
    callback(this.setPedalData("_bypass",0));
  }
  canyon(speed,callback) {
    let sp = (speed>3000)?3000:speed;
    this.setPedal("mixer");
    callback(this.setPedalData("channel2",1));
    this.setPedal("canyon");
    callback(this.setPedalData("_mode",9));
    callback(this.setPedalData("feedback",255));
    callback(this.setPedalData("delay",this.scale(sp,0,3000,0,255)));
    callback(this.setPedalData("_bypass",1));
    this.wait("feedback",0,sp).then(done => {
      callback(done);
      this.setPedal("mixer");
      callback(this.setPedalData("channel2",0));
    })
  }
  tensorStop(callback) {
    this.setPedal("tensor");
    callback(this.setPedalData("loopclear",0));
  }
  tensor(speed,callback) {
    let sp = (speed>4800)?4800:speed;
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