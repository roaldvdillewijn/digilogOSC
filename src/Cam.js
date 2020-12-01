import React, { useState, useEffect} from 'react';
import Webcam from "react-webcam";

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined
  })
  
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width:window.innerWidth,
        height:window.innerHeight
      });
    }

    window.addEventListener("resize",handleResize);

    handleResize();

    return () => window.removeEventListener("resize",handleResize);
  }, []);

  return windowSize;
}

const Cam = props => {
  const size = useWindowSize();
  const isLandscape = size.height <= size.width;
  const ratio = isLandscape ? size.width / size.height : size.height / size.width;

  return (
    <Webcam 
      audio={false}
      height = {size.height}
      width = {size.width}
      videoConstraints={{facingMode: 'user', aspectRatio: ratio, deviceId: props.deviceId}}
    />
  )
}

export default Cam;