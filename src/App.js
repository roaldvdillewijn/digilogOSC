import React, { useState} from 'react';
import './style/index.css';
import Editor from './Editor.js';
import WebcamOptions from './WebcamOptions';
import Mode from './Mode';
import Cam from './Cam';

const App = () => {
  const [deviceId,setDeviceId] = useState('');
  const [cam,setCam] = useState(false);
  const [menu,setMenu] = useState(true);
  const [ip,setIp] = useState('http://192.168.2.1:3000')
  
  return (
    <div>
      {cam&&<Cam
        deviceId = {deviceId}
      />}
      {menu && <WebcamOptions 
        setDeviceId={setDeviceId} 
        showWebcam={setCam} 
        camState={cam} 
        menuState={setMenu}
        ip={ip}
        saveIp={setIp}
      />}
      <Editor ip={ip} />
      <Mode onChoose={setMenu} />
    </div>
  );
}

export default App;
