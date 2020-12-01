import React, { useState, useEffect } from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2'
import socketIOClient from "socket.io-client";
import PedalOptions from './PedalOptions';
import ParamOptions from './ParamOptions';
import functionsgen from './assets/bind-functions.gen.json'
let socket, isMounted;

require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/keymap/sublime.js');
require('codemirror/addon/comment/comment.js');

const Editor = props => {
  const [code,setCode] = useState(); //for the code from the editor
  const [pedalOptions,setPedalOptions] = useState([]); //array with pedalOptions for a pedal that's in the current line
  const [pedals, setPedals] = useState({}); // list with pedals that are typed in the code
  const [params, setParams] = useState({}); //list with params that belongs to a certain pedal
  const [registers,setRegisters] = useState({}); //list with registers that needs to get a color in the editor
  const [paramOptions,setParamOptions] = useState([]); //list with paramOptions for a param that's in the current line
  const [fontsize,setFontsize] = useState(25);
  const [serial,setSerial] = useState([]);
  const [osc, setOsc] = useState([]);
  const [oscInfo,setOscInfo] = useState(null);
  let sentPedal = "";
  let sentParam = "";
  
  const loadBindings = () => {
    for (let i in functionsgen) {
      addRegister(i,"operator");
      for (let j in functionsgen[i]) {
        addRegister(j,"builtin");
      }
    }
    addRegister("set","builtin");
    addRegister("new","builtin");
  }

  const addPedal = pdl => {
    pedals[pdl] = true;
    setPedals(pedals);
  }

  const addParam = (prm,pdl) => {
    if (!params[pdl])params[pdl] = {};
    params[pdl][prm] = true;
    setParams(params);
  }

  const addRegister = (reg,type) => {
    registers[reg] = type;
    setRegisters(registers);
  }

  useEffect(() => {  
    isMounted = true; 
    if (isMounted) {
      loadBindings();
      if (socket)socket.disconnect();
      socket = socketIOClient(props.ip);
      socket.emit('message',{"address":"getCode","value":1}); 
    }

    socket.on("paramOptions",data => {
      if (isMounted) {
        setParamOptions(data);
      }
    });

    socket.on("serialData", data => {
      if (isMounted) setSerial(data);
    });

    socket.on("oscServer", data => {
      if (isMounted) setOscInfo(data);
    });

    socket.on("oscData", data => {
      if (isMounted) setOsc(data);
    });

    socket.on("pedalOptions",data => {
      if (isMounted) {
        setPedalOptions(data.value);
        data.value.map(item => {
          addRegister(item,"builtin");
          addParam(item,data.pedal);
          return null;
        });
      }
    })

    socket.on("currentCode", data => {
      if (isMounted) setCode(data);
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    }
  }, [props.ip]);

  const mercury = () => {
    let declarers = {
      "ring":true,
      "name":true
    }
    return {
      lineComment: "//",
      startState: () => {
        return {
          register:0
        }
      },
      token: function(stream,state) {
        let style, vcur, cur, ch = stream.next();
        if (/\d+$/.test(stream.current())){
          cur = stream.current().replace(/\s/g, '');
          return "number";
        }
        if (/\W/.test(stream.current())) {
          stream.eatWhile(/\W/);
          cur = stream.current().replace(/\s/g, '');
          if (cur === "[") {
            stream.skipTo("]");
            stream.next();
            return "tag";
          }
          if (cur === "[[") {
            stream.skipTo("]]");
            stream.next();
            return "tag"; 
          }
          if (cur === "//") {
            stream.skipToEnd();
            return "comment";
          }
          if (cur === '"') {
            stream.skipTo('"');
            return "string";
          }
        }
        if (/\w/.test(stream.current())) {
          stream.eatWhile(/\w/);
          cur = stream.current().toLowerCase().replace(/\s/g, '');
          style = registers[cur];
          state.register = declarers[cur]
          return style || null
        }
        if (state.register) {
          let curs = stream.current();
          if (curs === "(") {
            stream.eatWhile(/\w/);
            vcur = stream.current().toLowerCase().replace(/\s/g, '');
            //check if a name is given to an osc-emitter.
            if (ch === '(' && stream.next() === ')') {
              let pdl = vcur.replace(/\W/g,'')
              registers[pdl] = "variable";
              state.register = false;
              let col = stream.column();
              stream.backUp(col);
              if (stream.skipTo("osc")) {
               addPedal(pdl);
              }
              else {stream.skipTo("name")}
            }
          }
          //check if a new variable is declared with ring
          else if (curs === " " || curs === '\t' || curs === '\t\t' || curs === '(') {
            stream.eatWhile(/\w/);
            vcur = stream.current().toLowerCase().replace(/\s/g, ''); 
            if (ch === '\t' || ch === " " || ch === '\t\t') {
              addRegister(vcur, "variable");
              state.register = false;  
            }
          }
        }
      }
    }
  }

  const options = {
    lineNumbers:true,
    theme:"material",
    cursorHeight:0.85,
    keyMap:"sublime",
    extraKeys:{
      "Cmd-S": () => {
        sendCode()
      },
      "Cmd--": () => {
        setFontsize(fontsize-1);
      },
      "Cmd-=": () => {
        setFontsize(fontsize+1);
      }
    }
  }

  const mode = {
    name:"mercury",
    fn:mercury
  }

  const sendCode = () => {
    if (isMounted)socket.emit('message',{"address":"currentCode","value":code});
  }

  const updateCode = newCode => {
    setCode(newCode.value);
  }

  const serialData = serial.map((bytes, index) => {
    return (
      <span key={index}>[{bytes}]  </span>
    )
  })
  
  const onSelection = (data,editor) => {
    let lineString = editor.getLine(data.line);
    let found = 0;
    for (let i in pedals) {
      if (lineString.search(i) >= 0) {
        if (sentPedal !== i) {
          if(isMounted) socket.emit('message',{"address":"getPedalOptions","value":i});
          sentPedal = i;
        }
        found = 1;
      }  
    }
    if (!found) {
      setPedalOptions([]);
      setParamOptions([]);
      sentPedal = "";
      sentParam = "";
    }
    if (sentPedal && params[sentPedal]) {
      let found = 0;
      for (let i in params[sentPedal]) {
        if (lineString.search(i) >= 0) {
          if (sentParam !== i) {
            if (isMounted) socket.emit('message',{"address":"getParamOptions",value:[sentPedal,i]});
            sentParam = i;
          }
          found = 1;
        }
      }
      if (!found) {
        sentParam = "";
        setParamOptions([]);
      }
    }
  }

  return(
    <div className="main">
      <div className="codeBlock" style={{fontSize:fontsize}}>
        <CodeMirror
        value={code} 
        onBeforeChange={(editor, data, value) => {
          updateCode({value});
        }}
        onCursor={(editor,data) => {
          onSelection(data,editor);
        }}
        options={options}
        defineMode={mode}
        />
      </div>
      <div className="sideBlock">
        <div className="pedalOptions">
          <PedalOptions options={pedalOptions}/>
        </div>
        <div className="paramOptions">
          <ParamOptions options={paramOptions}/>
        </div>
        <div className="serial">
          {oscInfo}
          <br/><br/><span><u>OSC message</u></span><br/>
            {osc[0]}&nbsp;{osc[1]}&nbsp;{osc[2]}&nbsp;{osc[3]}&nbsp;{osc[4]}
          <br/><br/><span><u>Serial data</u></span><br/>
            {serialData}
        </div>
      </div>
    </div>
  ) 
}

export default Editor;