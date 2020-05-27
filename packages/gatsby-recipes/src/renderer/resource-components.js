const React = require(`react`)

const resources = require(`../resources`)

const { ResourceComponent } = require(`./render`)

const resourceComponents = Object.keys(resources).reduce(
  (acc, resourceName) => {
    acc[resourceName] = props => (
      <ResourceComponent _resourceName={resourceName} {...props} />
    )

    // Make sure the component is pretty printed in reconciler output
    acc[resourceName].displayName = resourceName

    return acc
  },
  {}
)

module.exports = resourceComponents
