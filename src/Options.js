import React, { useEffect, useState } from 'react';
import Table from './Table';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://192.168.2.1:3001";
let socket;

const Options = (props) => {
  const [info, setInfo] = useState([]);
  const headers = ["Param","OSC","Value","Options"];
  
  useEffect(() => {
    let isThisMounted = true;
    if(isThisMounted) {
      socket = socketIOClient(ENDPOINT);
      socket.emit('message',{"address":"getPedalInfo","value":props.pedal[0]});
    }

    socket.on("pedalInfo",data => {
      if (isThisMounted) {
        setInfo(data);
      }
    });

    return () => {
      isThisMounted = false
      socket.disconnect();
    }
  }, []);

  return (
    <div className="options">
      <div className="statusbar">
        <p className="optionsTitle">{props.pedal[1]}</p>
        <span className="close" onClick={() => {props.showOption(false)}}>x</span>          
      </div>
      <div className="optionsList">
        <Table bodyData = {info} showOptions = {props.showOption} headerData = {headers}/>
      </div>
    </div>
    // <div>"Test"</div>
  )

}


export default Options