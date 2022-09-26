import React from "react"

function _createContext(name, defaultValue) {
  if (React.createServerContext)
    return React.createServerContext(name, defaultValue)
  else return React.createContext(defaultValue)
}

const SlicesResultsContext = _createContext(`SlicesResultsContext`, {})
const SlicesContext = _createContext(`SlicesContext`, {})
const SlicesMapContext = _createContext(`SlicesMapContext`, {})
const SlicesPropsContext = _createContext(`SlicesPropsContext`, {})

export {
  SlicesResultsContext,
  SlicesContext,
  SlicesMapContext,
  SlicesPropsContext,
}
