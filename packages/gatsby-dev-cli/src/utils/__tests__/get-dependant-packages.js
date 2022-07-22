const { getDependantPackages } = require(`../get-dependant-packages`)

function createMockPackageNameToPath(packageNames) {
  const packageNameToPath = new Map()

  for (const packageName of packageNames) {
    packageNameToPath.set(packageName, `/test/${packageName}`)
  }

  return packageNameToPath
}

describe(`getDependantPackages`, () => {
  it(`handles deep dependency chains`, () => {
    const packagesToPublish = getDependantPackages({
      packageName: `package-a-dep1-dep1`,
      depTree: {
        "package-a-dep1": new Set([`package-a`]),
        "package-a-dep1-dep1": new Set([`package-a-dep1`]),
        "not-related": new Set([`also-not-related`]),
      },
      packageNameToPath: createMockPackageNameToPath([
        `package-a`,
        `package-a-dep1`,
        `package-a-dep1-dep1`,
        `not-related`,
        `also-not-related`,
      ]),
    })

    expect(packagesToPublish).toEqual(
      new Set([`package-a`, `package-a-dep1`, `package-a-dep1-dep1`])
    )
  })

  it(`doesn't get stuck in circular dependency loops`, () => {
    const packagesToPublish = getDependantPackages({
      packageName: `package-a`,
      depTree: {
        "package-a": new Set([`package-b`]),
        "package-b": new Set([`package-a`]),
      },
      packageNameToPath: createMockPackageNameToPath([
        `package-a`,
        `package-b`,
      ]),
    })
    expect(packagesToPublish).toEqual(new Set([`package-a`, `package-b`]))
  })
})
