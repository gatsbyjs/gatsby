import findDependencyMatch from "../find-dependency-match"

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
    const resourceThatWillNotMatch = {
      resourceDefinitions: {
        mdxType: `not important`,
        otherKey: `hi`,
      },
      dependsOn: [
        {
          resourceName: `foo`,
          name: `bar2`,
        },
      ],
    }

    const matches = findDependencyMatch(resources, resourceToMatch)
    const matches2 = findDependencyMatch(resources, resourceThatWillNotMatch)
    expect(matches).toHaveLength(1)
    expect(matches).toMatchSnapshot()
    expect(matches2).toHaveLength(1)
    expect(matches2).toMatchSnapshot()
  })
})
