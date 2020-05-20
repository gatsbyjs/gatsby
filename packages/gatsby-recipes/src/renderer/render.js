const React = require(`react`)
const { Suspense } = require(`react`)

const resources = require(`../resources`)

const RecipesReconciler = require(`./reconciler`)
const ErrorBoundary = require(`./error-boundary`)
const transformToPlan = require(`./transform-to-plan-structure`)

const promises = []
const cache = new Map()

const Wrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<p>Loading recipe...</p>}>{children}</Suspense>
  </ErrorBoundary>
)

const ResourceComponent = ({ _resourceName: Resource, ...props }) => {
  // eslint-disable-next-line
  const { mdxType, children, ...userProps } = props

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

const readResource = (resourceName, context, props) => {
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
    // Await all promises for resources and cache results
    await Promise.all(promises)
    // Rerender with the resources and resolve the data
    const result = RecipesReconciler.render(recipeWithWrapper, plan)
    return transformToPlan(result)
  } catch (e) {
    console.log(e)
    throw e
  }
}

module.exports.render = render
module.exports.ResourceComponent = ResourceComponent
