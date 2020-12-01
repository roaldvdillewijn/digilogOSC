import React, { useState, useEffect, useCallback } from 'react';

const WebcamMenu = props => {
  const [devices, setDevices] = useState([]);

  const handleDevices = useCallback(
    mediaDevices => 
      setDevices(mediaDevices.filter(({kind}) => kind === 'videoinput')),
    [setDevices]
  );

  useEffect( () => {
    async function getData() {
      await navigator.mediaDevices.getUserMedia({audio: true, video: true}); 
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }
    getData();
  }, [handleDevices]);

  

  const menuItems = devices.map((device,key) => {
      let items = [];
      items.push(<option key={key} value={device.deviceId}>{device.label}</option>)
      return (items)
  })

  return (
      <select onChange={props.setId}>
        {menuItems}
      </select>
  )
}

const WebcamOptions = props => {
  const [ip, setIP] = useState('');

  useEffect( () => {
    setIP(props.ip);
  },[props.ip])

  const setID = event => {
    props.setDeviceId(event.target.value);
  }

  const showCam = event => {
    props.showWebcam(event.target.checked);
  }

  const handleIp = event => {
    setIP(event.target.value);
  }

  const submitIP = () => {
    props.saveIp(ip);
    props.menuState(false);
  }

  return (
    <div className="camOptions">
      Select camera input: <WebcamMenu setId = {setID} />
      <br/>
      Show camera: <input type='checkbox' checked={props.camState} onChange = {showCam}/>
      <br/>
      Set IP: <input type='text' onChange={handleIp} value={ip} />
      <br/>
      <div className="bottomMenu close">
        <button onClick={() => {submitIP()}}>Close</button>
      </div>
      
    </div>
  )
}

export default WebcamOptions;