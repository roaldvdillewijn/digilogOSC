import React from 'react';

const Header = ({headerData}) => {
  const headers = headerData.map((head,index) => {
    return (
      <th key={index}>{head}</th>
    )
  });
  return (
    <thead>
      <tr>
        {headers}
      </tr>
    </thead>
  )
}

const Body = (props) => {
  const rows = props.bodyData.map((row,index) => {
    let column = [];
    for (let i in row) {
      switch(row[i].type) {
        case "text":
          column.push(<td key={i}>{row[i].text}</td>);
          break;
        case "button":
          column.push(<td key={i}><button onClick={() => {props.showOption(row[i].direction)}}>{row[i].text}</button></td>);
          break;
        case "list":
          if (row[i].text) {
            let keys = Object.keys(row[i].text);
            const options = keys.map((rows,indexes) => {
              let opt = [];
              opt.push(<li key={indexes}>{rows}</li>);
              return opt;
            });
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
  }); 
  return (
    <tbody>{rows}</tbody>
  )
}

const Table = (props) => {
  return (
    <table>
      <Header headerData = {props.headerData} />
      <Body bodyData = {props.bodyData} showOption = {props.showOption} />
    </table>
  )
}

export default Table