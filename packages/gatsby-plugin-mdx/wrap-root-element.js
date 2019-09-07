import React from "react"
import { MDXProvider, withMDXComponents } from "@mdx-js/react"
import { MDXScopeProvider } from "./context"

/**
 * so, this import is weird right?
 *
 * # What it looks like:
 * we're importing a webpack loader directly into our runtime bundle
 *
 * # What it's actually doing:
 * We configure the `mdx-components` loader in gatsby-node's
 * `onCreateWebpackConfig`. The configuration sets the loader to handle its
 * own file, so if we import `./loaders/mdx-components`, the `mdx-components`
 * loader handles loading itself.
 *
 * # Why does this work?
 * The loader doesn't use the file argument to itself and instead returns
 * a generated file that includes the `gatsby-config` mdxPlugins wrapped in
 * require() statements. This results in the `mdxPlugins` being required
 * and available to the code after this import.
 *
 * # Have a better solution to this?
 * Submit a PR
 */
import { plugins as mdxPlugins } from "./loaders/mdx-components"
import scopeContexts from "./loaders/mdx-scopes"

const componentsAndGuards = {}

const componentFromGuards = arr =>
  function GatsbyMDXComponentFinder(props) {
    const { Component } = arr.find(({ guard }) => (guard ? guard(props) : true))
    return <Component {...props} />
  }

mdxPlugins.forEach(({ guards = {}, components }) => {
  Object.entries(components).forEach(([componentName, Component]) => {
    if (componentsAndGuards[componentName]) {
      componentsAndGuards.push({ guard: guards[componentName], Component })
    } else {
      componentsAndGuards[componentName] = [
        { guard: guards[componentName], Component },
      ]
    }
  })
})

const components = Object.entries(componentsAndGuards)
  .map(([name, arr]) => {
    return {
      [name]: componentFromGuards(
        arr.concat({ guard: undefined, Component: name })
      ),
    }
  })
  .reduce((acc, obj) => {
    return { ...acc, ...obj }
  }, {})

// merge any components in wrapRootElement above this wrapRoot
const MDXConsumer = withMDXComponents(
  ({ components: componentsFromContext, children }) => (
    <MDXScopeProvider __mdxScope={scopeContexts}>
      <MDXProvider components={{ ...componentsFromContext, ...components }}>
        {children}
      </MDXProvider>
    </MDXScopeProvider>
  )
)

const WrapRootElement = ({ element }) => <MDXConsumer>{element}</MDXConsumer>

export default WrapRootElement
