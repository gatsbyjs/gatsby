import React, { Suspense, useContext, useState } from "react"
import Queue from "p-queue"
import lodash from "lodash"

import resources from "../resources"

import RecipesReconciler from "./reconciler"
import ErrorBoundary from "./error-boundary"
import transformToPlan from "./transform-to-plan-structure"
import {
  ParentResourceProvider,
  useParentResourceContext,
} from "./parent-resource-provider"
import { useRecipeStep } from "./step-component"
import { InputProvider, useInputByKey } from "./input-provider"
import {
  ResourceProvider,
  setResources,
  useResourceContext,
} from "./resource-provider"

const queue = new Queue({ concurrency: 1, autoStart: false })

let errors = []
const cache = new Map()

const ModeContext = React.createContext({})
const useMode = () => useContext(ModeContext)
const ModeProvider = ModeContext.Provider

const getInvalidProps = errors => {
  const invalidProps = errors.filter(e => {
    const details = e.details
    const unknownProp = details.find(e => e.type === `object.allowUnknown`)
    return unknownProp
  })
  return invalidProps
}

const getUserProps = props => {
  // eslint-disable-next-line
  const { mdxType, children, ...userProps } = props
  return userProps
}

const SetResourcesProvider = React.createContext()

let resourcesCache

const Wrapper = ({ children, inputs, isApply }) => {
  const [resourcesList, setResources] = useState(resourcesCache || [])
  resourcesCache = resourcesList

  return (
    <ErrorBoundary>
      <ModeProvider value={{ mode: isApply ? `apply` : `plan` }}>
        <SetResourcesProvider.Provider value={setResources}>
          <ResourceProvider value={resourcesList}>
            <InputProvider value={inputs}>
              <Suspense fallback={<p>Loading recipe...</p>}>
                {children}
              </Suspense>
            </InputProvider>
          </ResourceProvider>
        </SetResourcesProvider.Provider>
      </ModeProvider>
    </ErrorBoundary>
  )
}

const ResourceComponent = ({
  _resourceName: Resource,
  _uuid,
  _type,
  children,
  ...props
}) => {
  const { mode } = useMode()
  const step = useRecipeStep()
  const inputProps = useInputByKey(_uuid)
  const parentResourceContext = useParentResourceContext()
  const allResources = useResourceContext()
  const userProps = getUserProps(props)
  const allProps = { ...props, ...inputProps }

  const setResources = useContext(SetResourcesProvider)
  const resourceData = handleResource(
    Resource,
    { ...parentResourceContext, root: process.cwd(), _uuid, mode },
    allProps,
    allResources,
    setResources
  )

  return (
    <ParentResourceProvider data={{ [Resource]: resourceData }}>
      <Resource>
        {JSON.stringify({
          ...resourceData,
          _props: allProps,
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

const handleResource = (
  resourceName,
  context,
  props,
  allResources,
  setResources
) => {
  const error = validateResource(resourceName, context, props)
  if (error) {
    errors.push(error)
    return null
  }

  const { mode } = context

  const key = JSON.stringify({ resourceName, ...props, mode })

  const cachedResult = cache.get(key)

  if (cachedResult) {
    return cachedResult
  }

  const fn = mode === `apply` ? `create` : `plan`

  let promise
  try {
    promise = new Promise((resolve, reject) => {
      // Multiple of the same promises can be queued due to re-rendering
      // so this first checks for the cached result again before executing
      // the request.
      const cachedValue = cache.get(key)
      if (cachedValue) {
        resolve(cachedValue)
      }

      resources[resourceName][fn](context, props)
        .then(result => {
          allResources = allResources.filter(a => a.resourceDefinitions._key)
          const newResources = lodash.uniqBy(
            [
              {
                resourceName,
                resourceDefinitions: props,
                ...result,
              },
              ...allResources,
            ],
            r => r.resourceDefinitions._key
          )
          setResources(newResources)
          return result
        })
        .then(result => cache.set(key, result))
        .then(resolve)
        .catch(e => {
          console.log(e)
          reject(e)
        })
    })
  } catch (e) {
    throw e
  }

  queue.add(() => promise)

  throw promise
}

const render = async (recipe, cb, inputs = {}, isApply) => {
  const plan = {}

  const recipeWithWrapper = (
    <Wrapper inputs={inputs} isApply={isApply}>
      {recipe}
    </Wrapper>
  )

  const renderResources = async () => {
    queue.pause()

    RecipesReconciler.render(recipeWithWrapper, plan)

    if (errors.length) {
      const invalidProps = getInvalidProps(errors)

      if (invalidProps.length) {
        return cb({ type: `INVALID_PROPS`, data: invalidProps })
      } else {
        errors = []
      }
    }

    // If there aren't any new resources that need to be fetched, or errors, we're done!
    if (!queue.size && !errors.length) {
      return undefined
    }

    queue.start()
    await queue.onIdle()
    return await renderResources()
  }

  try {
    // Begin the "render loop" until there are no more resources being queued.
    await renderResources()

    if (errors.length) {
      // We found errors that were emitted back to the state machine, so
      // we don't need to re-render
      return null
    }

    // Rerender with the resources and resolve the data from the cache
    const result = RecipesReconciler.render(recipeWithWrapper, plan)
    return transformToPlan(result)
  } catch (e) {
    throw e
  }
}

module.exports.render = render
module.exports.ResourceComponent = ResourceComponent
