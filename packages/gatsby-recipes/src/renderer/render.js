const React = require(`react`)
const { Suspense } = require(`react`)

const resources = require(`../resources`)

const RecipesReconciler = require(`./reconciler`)
const ErrorBoundary = require(`./error-boundary`)
const transformToPlan = require(`./transform-to-plan-structure`)

const promises = []
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

  return (
    <Suspense fallback={<p>Reading resource...</p>}>
      <Resource>
        {JSON.stringify({
          ...readResource(Resource, { root: process.cwd() }, props),
          _props: userProps,
        })}
      </Resource>
    </Suspense>
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
      .catch(e => console.log(e))
  } catch (e) {
    throw e
  }

  promises.push(promise)

  throw promise
}

const render = async recipe => {
  const plan = {}

  const recipeWithWrapper = <Wrapper>{recipe}</Wrapper>

  try {
    // Run the first pass of the render to queue up all the promises and suspend
    RecipesReconciler.render(recipeWithWrapper, plan)

    if (errors.length) {
      const error = new Error(`Unable to validate resources`)
      error.errors = errors
      throw error
    }

    // Await all promises for resources and cache results
    await Promise.all(promises)
    // Rerender with the resources and resolve the data
    const result = RecipesReconciler.render(recipeWithWrapper, plan)
    return transformToPlan(result)
  } catch (e) {
    throw e
  }
}

module.exports.render = render
module.exports.ResourceComponent = ResourceComponent
