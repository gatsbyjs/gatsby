import * as Link from "./index.js"

module.exports = Link.default

Object.getOwnPropertyNames(Link).forEach(key => {
  Object.defineProperty(module.exports, key, {
    value: Link[key],
    enumerable: true,
  })
})
