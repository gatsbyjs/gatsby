const React = require(`react`)
const { mdx } = require(`@mdx-js/react`)
const { useMDXScope } = require(`./context`)

module.exports = function MDXRenderer({
  scope,
  children,
  ...props
}) {
  const mdxScope = useMDXScope(scope)

  // Memoize the compiled component
  const End = React.useMemo(() => {
    if (!children) {
      return null
    }

    const fullScope = {
      // React is here just in case the user doesn't pass them in
      // in a manual usage of the renderer
      React,
      mdx,
      ...mdxScope,
    }

    const keys = Object.keys(fullScope)
    const values = keys.map(key => fullScope[key])
    const fn = new Function(`_fn`, ...keys, `${children}`)

    return fn({}, ...values)
  }, [children, scope])

  return React.createElement(End, {...props })
}
