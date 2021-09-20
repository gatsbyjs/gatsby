// Match a resource's defined dependencies against all resources
// defined in the recipe.
export default function findDependencyMatch(
  resources,
  resourceWithDependencies
) {
  // Resource doesn't have a dependsOn key so we return
  if (!resourceWithDependencies.dependsOn) {
    return []
  } else {
    return resourceWithDependencies.dependsOn.map(dependency => {
      const { resourceName, ...otherValues } = dependency
      const keys = Object.keys(otherValues)

      const match = resources.find(resource => {
        // Is this the right resourceName?
        if (resourceName !== resource.resourceName) {
          return false
        }
        // Do keys match?
        if (
          !keys.every(
            key => Object.keys(resource.resourceDefinitions).indexOf(key) >= 0
          )
        ) {
          return false
        }

        // Do values match?
        if (
          !keys.every(
            key => resource.resourceDefinitions[key] === dependency[key]
          )
        ) {
          return false
        }

        return resource
      })

      if (match) {
        return match
      } else {
        const {
          // eslint-disable-next-line
          mdxType,
          ...resourceDefinition
        } = resourceWithDependencies.resourceDefinitions

        return {
          error: `A resource (${
            resourceWithDependencies.resourceName
          }: ${JSON.stringify(
            resourceDefinition
          )}) is missing its dependency on ${JSON.stringify(
            resourceWithDependencies.dependsOn[0]
          )}`,
        }
      }
    })
  }
}
