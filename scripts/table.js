const TableHeader = props => {
  const headers = props.headerData.map((head,index) => {
    return (
      <th key = {index}>{head}</th>
    )
  })
  return (
    <thead>
      <tr>
        {headers}
      </tr>
    </thead>
  )
}

const TableBody = props => {
  const rows = props.tableData.map((row,index) => {
    let column = [];
    for (let i in row) {
      switch(row[i].type) {
        case "text":
          column.push(<td key={i}>{row[i].text}</td>);
        break;
        case "number":
          column.push(<td key={i}><input readOnly type='number' value={row[i].text}/></td>);
        break;
        case "button":
          column.push(<td key={i}><button onClick={() => props.showOptions(row[i].direction)}>{row[i].text}</button></td>);
        break;
        case "list":
          if (row[i].text) {
            let keys = Object.keys(row[i].text);
            
            const options = keys.map((rows,indexes) => {
              console.log("rows:",rows);
              let opt = [];
              opt.push(<li key={indexes}>{rows}</li>)
              return opt
            })
            
            column.push(<td key={i}><ul>{options}</ul></td>);
          }
          else {
            column.push(<td key={i}></td>);
          }
        break;
        default: 
        break;
      }
    }
    return (
      <tr key={index}>{column}</tr>
    )
  })
  return <tbody>{rows}</tbody>
}

class Table extends React.Component {
  render() {
    const {tableData, showOptions, headerData} = this.props;
    return(
      <table>
        <TableHeader headerData={headerData}/>
        <TableBody tableData={tableData} showOptions={showOptions} />
      </table>
    )
  }
}