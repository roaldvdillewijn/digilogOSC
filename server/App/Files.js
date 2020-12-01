const fs = require('fs');
const dir = __dirname+'/';
const fileName = '../assets/code.txt';

class Files {
  readFile(callback) {
    fs.readFile(dir+fileName,'utf8',(err,f) => {
      if (!err) {
        callback(f);
      }
      else {
        console.log(err);
      }
    })
  }

  writeFile(data,callback) {
    fs.writeFile(dir+fileName,data,'utf8',(err,f) => {
      callback();
    });
  }
}


module.exports = {
  Files: new Files()
}