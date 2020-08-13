module.exports = (allResources, r) => {
  if (!r.dependsOn) {
    return []
  } else {
    return r.dependsOn.map(d => {
      const { resourceName, ...otherValues } = d
      const keys = Object.keys(otherValues)

      const match = allResources.find(r1 => {
        // Is this the right resourceName?
        if (resourceName !== r1.resourceName) {
          return false
        }
        // Do keys match?
        if (
          !keys.every(k => Object.keys(r1.resourceDefinitions).indexOf(k) >= 0)
        ) {
          return false
        }

        // Do values match?
        if (!keys.every(k => r1.resourceDefinitions[k] === d[k])) {
          return false
        }

        return r1
      })

      if (match) {
        return match
      } else {
        const {
          // eslint-disable-next-line
          mdxType,
          ...resourceDefinition
        } = r.resourceDefinitions

        return {
          error: `A resource (${r.resourceName}: ${JSON.stringify(
            resourceDefinition
          )}) is missing its dependency on ${JSON.stringify(r.dependsOn[0])}`,
        }
      }
    })
  }
}
