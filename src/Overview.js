import React, { useEffect, useState } from 'react';
import Options from './Options';
import Table from './Table';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://192.168.2.1:3001";
let socket

const Overview = () => {
  const [pedals,setPedals] = useState([]);
  const [serial,setSerial] = useState([]);
  const [osc, setOsc] = useState([]);
  const [oscInfo,setOscInfo] = useState(null);
  const [showOptions,setShowOptions] = useState(false);
  const header = ["Pedal","Type",""];
  
  useEffect(() => {  
    let isMounted = true; 
    if (isMounted) {
      socket = socketIOClient(ENDPOINT);
      socket.emit('message',{"address":"getPedals","value":1}); 
      socket.emit('message',{"address":"askForOscInfo","value":1});
    }

    socket.on("onlinePedals", data => {
      if (isMounted) setPedals(data);
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
    
    return () => {
      isMounted = false
      socket.disconnect();
    }
  }, []);


  const serialData = serial.map((bytes, index) => {
    return (
      <span key={index}>[{bytes}]  </span>
    )
  })
  return (
    
    <div className="container">
    {showOptions
     ?<Options showOption = {setShowOptions} pedal = {showOptions} />
     :null
    }
    <Table headerData = {header} bodyData = {pedals} showOption = {setShowOptions}/>
    <div className="serial">
        {oscInfo}
      <br/><br/><span><u>OSC message</u></span><br/>
        {osc[0]}&nbsp;{osc[1]}&nbsp;{osc[2]}&nbsp;{osc[3]}&nbsp;{osc[4]}
      <br/><br/><span><u>Serial data</u></span><br/>
        {serialData}
      </div>
    </div>
  )
}

export default Overview;