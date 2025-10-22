import React from "react"

const counterStyle = {
  display: `flex`,
  flexFlow: `row nowrap`,
  alignItems: `center`,
  padding: `0.2em 0.4em`,
  borderRadius: `2px`,
  backgroundColor: `rgba(0, 0, 0, 0.2)`,
  boxShadow: `inset 2px 1.5px 4px rgba(0, 0, 0, 0.2)`,
}

export default function Counter({initialvalue}) {
  static defaultProps = {
    initialvalue: 0,
  }

  const handleIncrement = () => {
    this.setState(state => {
      return {
        value: state.value + 1,
      }
    })
  };

  const handleDecrement = () => {
    this.setState(state => {
      return {
        value: state.value - 1,
      }
    })
  };

  return (
<span style={counterStyle}>
<strong style={{ flex: `1 1` }}>{this.state.value}</strong>
<button onClick={handleDecrement}>-1</button>
<button onClick={handleIncrement}>+1</button>
</span>
);
}
