const React = require(`react`)
const { Suspense } = require(`react`)

const resources = require(`../resources`)

const RecipesReconciler = require(`./reconciler`)
const ErrorBoundary = require(`./error-boundary`)

const promises = []
const cache = new Map()

const Wrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<p>Loading recipe...</p>}>{children}</Suspense>
  </ErrorBoundary>
)

const ResourceComponent = ({ _resourceName: Resource, ...props }) => (
  <Suspense fallback={<p>Reading resource...</p>}>
    <Resource>
      {JSON.stringify(readResource(Resource, { root: __dirname }, props))}
    </Resource>
  </Suspense>
)

const File = props => <ResourceComponent _resourceName="File" {...props} />

const NPMPackage = props => (
  <ResourceComponent _resourceName="NPMPackage" {...props} />
)

const readResource = (resourceName, context, props) => {
  const key = JSON.stringify({ resourceName, ...props })
  const cachedResult = cache.get(key)

  if (cachedResult) {
    return cachedResult
  }

  const promise = resources[resourceName]
    .plan(context, props)
    .then(result => cache.set(key, result))

  promises.push(promise)

  throw promise
}

const render = async recipe => {
  const plan = {}

  const recipeWithWrapper = <Wrapper>{recipe}</Wrapper>

  // Run the first pass of the render to queue up all the promises and suspend
  await RecipesReconciler.render(recipeWithWrapper, plan)
  // Await all promises for resources and cache results
  await Promise.all(promises)
  // Rerender with the resources and resolve the data
  const result = await RecipesReconciler.render(recipeWithWrapper, plan)

  return result
}

module.exports.render = render
module.exports.File = File
module.exports.NPMPackage = NPMPackage
