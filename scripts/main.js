'use strict'
//deze pagina opdelen in subpagina's
const socket = io();
socket.emit('message',{"address":"getPedals","value":1});  

function readSocket(address,callback) {
  socket.on(address,data => {
    callback(data);
  })  
}

class App extends React.Component {
  state = {
    pedals: [],
    headers:["Pedal","Type",""],
    displayOptions: false,
    pedal:null,
    serial:[],
    osc: [],
    oscInfo: null
  }
  constructor(props) {
    super(props);
    socket.emit('message',{"address":"askForOscInfo","value":1});
    readSocket('onlinePedals',data =>  {
      this.setState({
        pedals: [...this.state.pedals,data]
      });
    });
    readSocket('serialData',data => {
      this.setState({
        serial: data
      });
    });
    readSocket('oscData',data => {
      this.setState({
        osc: data
      });
    });
    readSocket('oscServer',data => {
      this.setState({
        oscInfo:data
      })
    })
  }
  showOptions = (index) => {
    socket.emit('message',{"address":"getPedalInfo","value":index[0]});
    this.setState({
      displayOptions: true,
      pedal: index[1]
    });    
  }
  closeOptions = index => {
    this.setState({
      displayOptions: false
    });
  }
  componentWillUnmount() {
    socket.removeAllListeners('onlinePedals');
  }
  render() {
    const {pedals,pedal,headers,serial,osc,oscInfo} = this.state;
    const serialData = serial.map((bytes, index) => {
      return (
        <span key={index}>[{bytes}]  </span>
      )
    })
    return (
      <div className="container" id='container'>
        <Table tableData={pedals} showOptions = {this.showOptions} headerData = {headers} />
        {this.state.displayOptions && <Options closeOptions = {this.closeOptions} pedal = {pedal}  />}
        <div className="serial">
          {oscInfo}
          <br/><span><u>OSC message</u></span><br/>
          {osc[0]} {osc[1]}
          <br/><span><u>Serial data</u></span><br/>
          {serialData}
        </div>
      </div>
    )   
  }
}

ReactDOM.render(<App />,document.getElementById('root'));