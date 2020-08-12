const findDependencyMatch = require(`../find-dependency-match`)

describe(`findDependencyMatch`, () => {
  test(`basic matching`, () => {
    const resources = [
      {
        resourceName: `foo`,
        resourceDefinitions: {
          name: `foos`,
        },
      },
      {
        resourceName: `foo`,
        resourceDefinitions: {
          name: `bar`,
        },
      },
      {
        resourceName: `foobar`,
        resourceDefinitions: {
          name: `bar`,
        },
      },
    ]
    const resourceToMatch = {
      dependsOn: [
        {
          resourceName: `foo`,
          name: `bar`,
        },
      ],
    }

    const matches = findDependencyMatch(resources, resourceToMatch)
    expect(matches).toHaveLength(1)
    expect(matches).toMatchSnapshot()
  })
})
