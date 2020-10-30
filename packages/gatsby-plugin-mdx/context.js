const React = require('react')

const GatsbyMDXScopeContext = React.createContext({})

exports.useMDXScope = scope => {
  const contextScope = React.useContext(GatsbyMDXScopeContext)
  return scope || contextScope
}

exports.MDXScopeProvider = ({ __mdxScope, children }) =>
  React.createElement(
    GatsbyMDXScopeContext.Provider,
    { value: __mdxScope },
    children
  )


