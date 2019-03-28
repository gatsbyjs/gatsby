const { getDependantPackages } = require(`../get-dependant-packages`)

describe(`getDependantPackages`, () => {
  it(`handles deep dependency chains`, () => {
    const packagesToPublish = getDependantPackages({
      packageName: `package-a-dep1-dep1`,
      depTree: {
        "package-a-dep1": new Set([`package-a`]),
        "package-a-dep1-dep1": new Set([`package-a-dep1`]),
        "not-related": new Set([`also-not-related`]),
      },
    })

    expect(packagesToPublish).toEqual(
      new Set([`package-a`, `package-a-dep1`, `package-a-dep1-dep1`])
    )
  })
})
