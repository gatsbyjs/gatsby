import React, { Component } from "react"

const positionStore = {}

const PositionContext = React.createContext({
  positions: positionStore,
  onPositionChange: () => {},
})

export default class ScrollPositionProvider extends Component {
  state = { positions: positionStore }

  onPositionChange = (cacheName, position) => {
    console.log({cacheName, position})

    this.setState(() => {
      positionStore[cacheName] = position
      return { positions: { ...positionStore } }
    })
  }

  render() {
    return (
      <PositionContext.Provider
        value={{
          positions: this.state.positions,
          onPositionChange: this.onPositionChange,
        }}
      >
        {this.props.children}
      </PositionContext.Provider>
    )
  }
}

export const ScrollPositionConsumer = PositionContext.Consumer
