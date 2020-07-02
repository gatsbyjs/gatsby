import React from "react"
import AbstractSymbol from "./abstract-symbol.svg"
import AtomicSymbol from "./atomic-symbol.svg"
import GraphqlLogo from "./graphql-logo.svg"
import ReactLogo from "./react-logo.svg"
import AppWindow from "./app-window.svg"

const LayerIcon = ({ name }) => {
  const icons = {
    AbstractSymbol: <AbstractSymbol />,
    AtomicSymbol: <AtomicSymbol />,
    GraphqlLogo: <GraphqlLogo />,
    ReactLogo: <ReactLogo />,
    AppWindow: <AppWindow />,
  }
  return icons[name]
}

export default LayerIcon
