import React from 'react'

class DynamicComponent extends React.Component {
  handleClick = () => {
    console.log(`Sync-Click!`)
    import(/* webpackChunkName: "async-console", webpackPreload: true */ `../utils/async-console`).then(module => {
      const asyncConsole = module.default
      asyncConsole(`Async-Log!`)
    })
  }

  render() {
    return <button onClick={this.handleClick}>
        Dynamic Log
      </button>
  }
}

export default DynamicComponent
