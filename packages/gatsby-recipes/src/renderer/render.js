import React, { Suspense } from "react"
import Queue from "p-queue"

import resources from "../resources"

import RecipesReconciler from "./reconciler"
import ErrorBoundary from "./error-boundary"
import transformToPlan from "./transform-to-plan-structure"
import { ResourceProvider } from "./resource-provider"

const queue = new Queue({ concurrency: 1, autoStart: false })

const errors = []
const cache = new Map()

const getUserProps = props => {
  // eslint-disable-next-line
  const { mdxType, children, ...userProps } = props
  return userProps
}

const Wrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<p>Loading recipe...</p>}>{children}</Suspense>
  </ErrorBoundary>
)

const ResourceComponent = ({ _resourceName: Resource, ...props }) => {
  const userProps = getUserProps(props)
  const resourceData = readResource(Resource, { root: process.cwd() }, props)

  return (
    <ResourceProvider data={{ [Resource]: resourceData }}>
      <Resource>
        {JSON.stringify({ ...resourceData, _props: userProps })}
      </Resource>
    </ResourceProvider>
  )
}

const validateResource = (resourceName, _context, props) => {
  const userProps = getUserProps(props)
  const { error } = resources[resourceName].validate(userProps)
  return error
}

const readResource = (resourceName, context, props) => {
  const error = validateResource(resourceName, context, props)
  if (error) {
    errors.push(error)
    return null
  }

  const key = JSON.stringify({ resourceName, ...props })
  const cachedResult = cache.get(key)

  if (cachedResult) {
    return cachedResult
  }

  let promise
  try {
    promise = resources[resourceName]
      .plan(context, props)
      .then(result => cache.set(key, result))
      .catch(e => {
        console.log(e)
        throw e
      })
  } catch (e) {
    throw e
  }

  queue.add(() => promise)

  throw promise
}

const render = async recipe => {
  const plan = {}

  const recipeWithWrapper = <Wrapper>{recipe}</Wrapper>

  try {
    // Run the first pass of the render to queue up top-level resources
    RecipesReconciler.render(recipeWithWrapper, plan)

    // If there are any errors, throw an error to pass to the client
    if (errors.length) {
      const error = new Error(`Unable to validate resources`)
      error.errors = errors
      throw error
    }

    queue.start()

    // Work is done
    await queue.onIdle()

    // Rerender with the resources and resolve the data
    const result = RecipesReconciler.render(recipeWithWrapper, plan)
    return transformToPlan(result)
  } catch (e) {
    throw e
  }
}

module.exports.render = render
module.exports.ResourceComponent = ResourceComponent
