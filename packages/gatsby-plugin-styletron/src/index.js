import { Client, Server } from "styletron-engine-atomic"
import { driver } from "styletron-standard"

let instance

export default (() => options => {
  if (!instance) {
    if (typeof window !== `undefined` && window.document.createElement) {
      const styleElements = document.getElementsByClassName(
        `_styletron_hydrate_`
      )
      instance = new Client({ hydrate: styleElements, ...options })
    } else {
      instance = new Server(options)
    }
  }
  return {
    css: json => driver(json, instance),
    instance: instance,
  }
})()
