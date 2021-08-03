const { Client, Server } = require(`styletron-engine-atomic`)

let memoizedValue

module.exports = (() => options => {
  if (!memoizedValue) {
    let instance
    if (typeof window !== `undefined` && window.document.createElement) {
      const styleElements =
        document.getElementsByClassName(`_styletron_hydrate_`)
      instance = new Client({ hydrate: styleElements, ...options })
    } else {
      instance = new Server(options)
    }
    memoizedValue = {
      instance,
    }
  }
  return memoizedValue
})()
