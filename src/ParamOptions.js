import React from 'react';

const PedalOptions = props => {
  const options = props.options.map((option,index) => {
    let column = [];
    let back = ',';
    if (props.options.length-1 === index) {
      back = ''
    }
    column.push(<span key={index}>{option}{back} </span>)
    return column;
  }); 
  return (
    <div>
      {options}
    </div>
  )
}

export default PedalOptions
