class Options extends React.Component {
  state = {
    parameters:[],
    headers:["Param","OSC","Value","Min","Max"],
  }
  constructor(props) {
    super(props);
    readSocket('pedalInfo',data => {
      this.setState({
        parameters: [...this.state.parameters,data]
      });
    })
  }
  componentWillUnmount() {
    socket.removeAllListeners('pedalInfo');
  }
  updateValues() {

  }
  render() {
    const {parameters,headers,rowInfo} = this.state
    const {closeOptions,pedal} = this.props
    return (
      <div className="options">
        <div className="statusbar">
          <p className="optionsTitle">{pedal}</p>
          <span className="close" onClick={() => {closeOptions()}}>x</span>          
        </div>
        <div className="optionsList">
          <Table tableData = {parameters} showOptions = {this.updateValues} headerData = {headers}/>
        </div>
      </div>
    )
  }
}