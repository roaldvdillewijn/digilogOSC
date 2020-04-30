const scales = require('../assets/scales.json');

class CreateSeq {
  constructor() {
    this.key;
    this.chance;
    this.valueList = [];
    this.paramList = ["stepone","steptwo","stepthree","stepfour","stepfive","stepsix"]
    this.pitchList = {"-12":12,"-11":16,"-10":20,"-9":24,"-8":28,"-7":32,"-6":36,"-5":40,"-4":45,"-3":49,"-2":53,"-1":57,"0":67,"1":77,"2":81,"3":86,"4":90,"5":94,"6":98,"7":102,"8":106,"9":110,"10":114,"11":118,"12":126} 
  }
  rand(number) {
    let rnd = Math.floor(Math.random()*number) 
    return rnd;
  }
  do(pedal,value,callback) {  
    if (Array.isArray(value)) {
      [this.key, this.chance] = value;
    }
    else {
      this.key = value;
      this.chance = 70;
    }
    
    for (let i=0;i<6;i++){
      if (this.rand(100) < this.chance) {
        let rnd = scales[this.key][Math.floor(this.rand(scales[this.key].length))]
        rnd = (this.rand(10) < 5)?rnd*-1:rnd;
        this.valueList[i] = this.pitchList[rnd];
      }
      else {
        this.valueList[i] = (this.rand(10)<5)?0:127;
      }
    }
    for (let i in this.valueList) {
      callback({"type":"pedalData","pedal":pedal,"param":this.paramList[i],"value":this.valueList[i]});
    }
  }
}

module.exports = {
  CreateSeq: new CreateSeq()
}