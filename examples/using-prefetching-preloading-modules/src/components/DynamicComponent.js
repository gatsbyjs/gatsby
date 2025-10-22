import React from "react"

function DynamicComponent() {
  const handleClick = () => {
    console.log(`Sync-Click!`)
    import(
      /* webpackChunkName: "async-console", webpackPreload: true */ `../utils/async-console`
    ).then(module => {
      const asyncConsole = module.default
      asyncConsole(`Async-Log!`)
    })
  };

  return <button onClick={handleClick}>Dynamic Log</button>;
}

export default DynamicComponent
