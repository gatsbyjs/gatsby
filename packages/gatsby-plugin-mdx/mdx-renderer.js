const React = require(`react`)
const { mdx } = require(`@mdx-js/react`)
const { useMDXScope } = require(`./context`)
const { getModule } = require(`gatsby`)

module.exports = function MDXRenderer({
  scope,
  children,
  ...props
}) {
  const mdxScope = useMDXScope(scope)

  // Memoize the compiled component
  const End = React.useMemo(() => {
    if (!children || !children.body) {
      return null
    }

    let moduleScope = {}
    if (children.moduleMapping && getModule) {
      moduleScope = children.moduleMapping.reduce(
        (scope, moduleMappingEntry) => {
          scope[moduleMappingEntry.local] = getModule(
            moduleMappingEntry.moduleID
          )
          return scope
        },
        {}
      )
    }

    const fullScope = {
      // React is here just in case the user doesn't pass them in
      // in a manual usage of the renderer
      React,
      mdx,
      ...mdxScope,
      ...moduleScope,
    }

    const keys = Object.keys(fullScope)
    const values = keys.map(key => fullScope[key])
    const fn = new Function(`_fn`, ...keys, `${children.body}`)

    return fn({}, ...values)
  }, [children.body, scope])

  return React.createElement(End, {...props })
}
