const { Client, Server } = require(`styletron-engine-atomic`)
const { driver } = require(`styletron-standard`)

let memoizedValue

module.exports = (() => options => {
  if (!memoizedValue) {
    let instance
    if (typeof window !== `undefined` && window.document.createElement) {
      const styleElements = document.getElementsByClassName(
        `_styletron_hydrate_`
      )
      instance = new Client({ hydrate: styleElements, ...options })
    } else {
      instance = new Server(options)
    }
    memoizedValue = {
      css: json => driver(json, instance),
      instance,
    }
  }
  return memoizedValue
})()
