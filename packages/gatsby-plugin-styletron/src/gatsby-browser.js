import { createElement as h } from "react"
import styletron from "./index.js"
import { Provider } from "styletron-react"

exports.wrapRootComponent = ({ Root }, options) => () =>
  h(Provider, { value: styletron(options).instance }, h(Root))
