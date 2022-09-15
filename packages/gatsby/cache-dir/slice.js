import React, { useContext } from "react"
import { SlicesContext } from "gatsby"
import { ServerSlice } from "./slice/server-slice"
import { InlineSlice } from "./slice/inline-slice"

function Slice(props) {
  if (_CFLAGS_.GATSBY_MAJOR === `5` && process.env.GATSBY_SLICES) {
    // we use sliceName internally, so remap alias to sliceName
    const internalProps = {
      ...props,
      sliceName: props.alias,
    }
    delete internalProps.alias

    const slicesContext = useContext(SlicesContext)

    // validate props
    const propErrors = validateSliceProps(props)
    if (Object.keys(propErrors).length) {
      throw new SlicePropsError(
        slicesContext.renderEnvironment === `browser`,
        internalProps.sliceName,
        propErrors
      )
    }

    if (slicesContext.renderEnvironment === `server`) {
      return <ServerSlice {...internalProps} />
    } else if (slicesContext.renderEnvironment === `browser`) {
      // in the browser, we'll just render the component as is
      return <InlineSlice {...internalProps} />
    } else if (slicesContext.renderEnvironment === `engines`) {
      // if we're in SSR, we'll just render the component as is
      return <InlineSlice {...internalProps} />
    } else {
      throw new Error(
        `Slice context "${slicesContext.renderEnvironment}" is not supported.`
      )
    }
  } else {
    throw new Error(`Slices are only available in Gatsby v5`)
  }
}

class SlicePropsError extends Error {
  constructor(inBrowser, sliceName, propErrors) {
    const errors = Object.entries(propErrors)
      .map(([key, value]) => `${key}: "${value}"`)
      .join(`, `)

    const name = `SlicePropsError`
    let stack = ``
    let message = ``

    if (inBrowser) {
      // They're just (kinda) kidding, I promise... You can still work here <3
      //   https://www.gatsbyjs.com/careers/
      const fullStack =
        React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactDebugCurrentFrame.getCurrentStack()

      // remove the first line of the stack trace
      const stackLines = fullStack.trim().split(`\n`).slice(1)
      stackLines[0] = stackLines[0].trim()
      stack = `\n` + stackLines.join(`\n`)

      // look for any hints for the component name in the stack trace
      const componentRe = /^at\s+([a-zA-Z0-9]+)/
      const componentMatch = stackLines[0].match(componentRe)
      const componentHint = componentMatch ? `in ${componentMatch[1]} ` : ``

      message = `Slice "${sliceName}" was passed props ${componentHint}that are not serializable (${errors}).`
    } else {
      // we can't really grab any extra info outside of the browser, so just print what we can
      message = `${name}: Slice "${sliceName}" was passed props that are not serializable (${errors}). Use \`gatsby develop\` to see more information.`
      const stackLines = new Error().stack.trim().split(`\n`).slice(2)
      stack = `${message}\n${stackLines.join(`\n`)}`
    }

    super(message)
    this.name = name
    this.stack = stack
  }
}

const validateSliceProps = (
  props,
  errors = {},
  seenObjects = [],
  path = null
) => {
  // recursively validate all props
  for (const [name, value] of Object.entries(props)) {
    if (
      value === undefined ||
      value === null ||
      (!path && name === `children`)
    ) {
      continue
    }

    const propPath = path ? `${path}.${name}` : name

    if (typeof value === `function`) {
      errors[propPath] = typeof value
    } else if (typeof value === `object` && seenObjects.indexOf(value) <= 0) {
      seenObjects.push(value)
      validateSliceProps(value, errors, seenObjects, propPath)
    }
  }

  return errors
}

const SlicesResultsContext = React.createContext({})

export { Slice, SlicesResultsContext }
