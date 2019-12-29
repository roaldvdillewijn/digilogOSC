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
    pedal:"null"
  }
  constructor(props) {
    super(props);
    readSocket('onlinePedals',data =>  {
      this.setState({
        pedals: [...this.state.pedals,data]
      });
    });
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
    const {pedals,pedal,headers} = this.state;
    return (
      <div className="container" id='container'>
        <Table tableData={pedals} showOptions = {this.showOptions} headerData = {headers} />
        {this.state.displayOptions && <Options closeOptions = {this.closeOptions} pedal = {pedal}  />}
      </div>
    )   
  }
}

ReactDOM.render(<App />,document.getElementById('root'));