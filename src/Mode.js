const Mode = ({onChoose}) => {
    return (
      <div className="bottomMenu">
        <button onClick={() => {onChoose(true)}}>Options</button>
      </div>
    )
  }

  export default Mode;