import React, { Suspense, useContext } from "react"
import Queue from "better-queue"
import lodash from "lodash"
import mitt from "mitt"

import * as resources from "../resources"

import RecipesReconciler from "./reconciler"
import ErrorBoundary from "./error-boundary"
import transformToPlan from "./transform-to-plan-structure"
import {
  ParentResourceProvider,
  useParentResourceContext,
} from "./parent-resource-provider"
import { useRecipeStep } from "./step-component"
import { InputProvider } from "./input-provider"
import { ResourceProvider, useResourceContext } from "./resource-provider"
import findDependencyMatch from "../find-dependency-match"

const errorCache = new Map()

const GlobalsContext = React.createContext({})
const useGlobals = () => useContext(GlobalsContext)
const GlobalsProvider = GlobalsContext.Provider

const getUserProps = props => {
  // eslint-disable-next-line
  const { mdxType, children, ...userProps } = props
  return userProps
}

const Wrapper = ({
  children,
  inputs,
  isApply,
  resultCache,
  inFlightCache,
  blockedResources,
  queue,
  plan,
}) => (
  <ErrorBoundary>
    <GlobalsProvider
      value={{
        mode: isApply ? `apply` : `plan`,
        resultCache,
        inFlightCache,
        blockedResources,
        queue,
      }}
    >
      <ResourceProvider value={plan}>
        <InputProvider value={inputs}>
          <Suspense fallback={<p>Loading recipe 1/2...</p>}>
            {children}
          </Suspense>
        </InputProvider>
      </ResourceProvider>
    </GlobalsProvider>
  </ErrorBoundary>
)

const ResourceComponent = ({
  _resourceName: Resource,
  _uuid,
  _type,
  children,
  ...props
}) => {
  const {
    mode,
    resultCache,
    inFlightCache,
    blockedResources,
    queue,
  } = useGlobals()
  const step = useRecipeStep()
  const parentResourceContext = useParentResourceContext()

  // TODO add provider onto context
  const resourceData = handleResource(
    Resource,
    {
      ...parentResourceContext,
      root: process.cwd(),
      _uuid,
      mode,
      resultCache,
      inFlightCache,
      blockedResources,
      queue,
    },
    props
  )

  return (
    <ParentResourceProvider data={{ [Resource]: resourceData }}>
      <Resource>
        {JSON.stringify({
          ...resourceData,
          _props: props,
          _stepMetadata: step,
          _uuid,
          _type,
        })}
        {children}
      </Resource>
    </ParentResourceProvider>
  )
}

const validateResource = (resourceName, context, props) => {
  const userProps = getUserProps(props)
  const { error } = resources[resourceName].validate(userProps)
  if (error) {
    error.resourceUuid = context._uuid
  }
  return error
}

const handleResource = (resourceName, context, props) => {
  // Initialize
  const { mode, resultCache, inFlightCache, blockedResources, queue } = context

  // TODO use session ID to ensure the IDs are unique..
  const trueKey = props._key ? props._key : context._uuid

  let cacheKey
  // Only run apply once per resource
  if (mode === `apply`) {
    cacheKey = mode + ` ` + resourceName + ` ` + trueKey
  } else {
    cacheKey = JSON.stringify({ resourceName, ...props, mode })
  }

  if (!errorCache.has(trueKey)) {
    const error = validateResource(resourceName, context, props)
    errorCache.set(trueKey, error)
    if (error) {
      const result = {
        error: `Validation error: ${error.details[0].message}`,
      }
      resultCache.set(cacheKey, result)
      return result
    }
  }

  const cachedResult = resultCache.get(cacheKey)
  const inFlightPromise = inFlightCache.get(cacheKey)

  if (cachedResult) {
    return cachedResult
  }

  if (inFlightPromise) {
    throw inFlightPromise
  }

  // If this resource requires another resource to be created before it,
  // check to see if they're created. The first time this is called,
  // create a promise which we cache and keep throwing until
  // all the dependencies are created & then we reject the promise
  // to trigger andother render where we finally can create the
  // now no-longer-blocked resource.
  //
  // TODO test this when we can mock resources by varying what
  // resources depend on what & which return first and ensuring
  // resources end in right order.
  const allResources = useResourceContext()
  const resourcePlan = allResources?.find(
    a => a.resourceDefinitions._key === trueKey || a._uuid === trueKey
  )
  if (mode === `apply` && resourcePlan.dependsOn) {
    const matches = findDependencyMatch(allResources, resourcePlan)
    let outsideReject
    if (!matches.every(m => m.isDone)) {
      // Probably we're going to need a state machine
      // just for installing things, sheesh.
      if (blockedResources.get(cacheKey)) {
        throw blockedResources.get(cacheKey).promise
      }
      const promise = new Promise((resolve, reject) => {
        outsideReject = reject
      })
      blockedResources.set(cacheKey, { promise, outsideReject })
      throw promise
    } else {
      blockedResources.get(cacheKey).outsideReject()
      blockedResources.delete(cacheKey)
    }
  }

  const fn = mode === `apply` ? `create` : `plan`

  let promise
  try {
    promise = new Promise((resolve, reject) => {
      // Multiple of the same promises can be queued due to re-rendering
      // so this first checks for the cached result again before executing
      // the request.
      const cachedValue = resultCache.get(cacheKey)
      if (cachedValue) {
        resolve(cachedValue)
      } else {
        resources[resourceName][fn](context, props)
          .then(result => {
            if (fn === `create`) {
              result.isDone = true
            }
            inFlightCache.set(cacheKey, false)
            return result
          })
          .then(result => {
            resultCache.set(cacheKey, result)
            return result
          })
          .then(resolve)
          .catch(e => {
            if (e.name === `MissingInfoError`) {
              inFlightCache.delete(cacheKey)
            }
            reject(e)
          })
      }
    })
  } catch (e) {
    throw e
  }

  inFlightCache.set(cacheKey, promise)

  queue.push(promise)

  throw promise
}

const render = (recipe, cb, context = {}, isApply, isStream, name) => {
  const { inputs } = context
  const emitter = mitt()
  const renderState = {}

  const queue = new Queue(
    async (job, cb) => {
      const result = await job
      cb(null, result)
    },
    { concurrent: 10000 }
  )

  const resultCache = new Map()
  const inFlightCache = new Map()
  const blockedResources = new Map()

  let result
  let resourcesArray = []

  const recipeWithWrapper = (
    <Wrapper
      inputs={inputs}
      plan={context.plan}
      isApply={isApply}
      resultCache={resultCache}
      inFlightCache={inFlightCache}
      blockedResources={blockedResources}
      queue={queue}
    >
      {recipe}
    </Wrapper>
  )

  // Keep calling render until there's remaining resources to render.
  // This let's resources that depend on other resources to pause until one finishes.
  const renderResources = isDrained => {
    result = RecipesReconciler.render(recipeWithWrapper, renderState, name)

    resourcesArray = transformToPlan(result)

    // Tell UI about updates.
    emitter.emit(`update`, resourcesArray)

    const isDone = () => {
      let result
      // Mostly for validation stage that checks that there's no resources
      // in the initial step — this done condition says no resources were found
      // and there's no inflight resource work (resources will be empty until the
      // first resource returns).
      //
      // We use "inFlightCache" because the queue doesn't immediately show up
      // as having things in it.
      if (
        resourcesArray.length === 0 &&
        ![...inFlightCache.values()].some(a => a)
      ) {
        result = true
        // If there's still nothing on the queue and we've drained the queue, that means we're done.
      } else if (
        isDrained &&
        queue.length === 0 &&
        blockedResources.size === 0
      ) {
        result = true
        // If there's one resource & it fails validation, it doesn't go into the queue
        // so we check if inFlightCache is empty & all resources have an error.
      } else if (
        !resourcesArray.some(r => !r.error) &&
        ![...inFlightCache.values()].some(a => a)
      ) {
        result = true
      } else {
        result = false
      }

      return result
    }

    if (isDone()) {
      // Rerender with the resources and resolve the data from the cache.
      emitter.emit(`done`, resourcesArray)
    }
  }

  const throttledRenderResources = lodash.throttle(renderResources, 100)

  queue.on(`task_finish`, function (taskId, r, stats) {
    throttledRenderResources()
  })

  queue.on(`drain`, () => {
    renderResources(true)
  })

  // When there's no resources, renderResources finishes synchronously
  // so wait for the next tick so the emitter listeners can be setup first.
  process.nextTick(() => renderResources())

  if (isStream) {
    return emitter
  } else {
    return new Promise((resolve, reject) => {
      emitter.on(`*`, (type, e) => {
        if (type === `done`) {
          resolve(e)
        }
        if (type === `error`) {
          reject(e)
        }
      })
    })
  }
}

export { render, ResourceComponent }
