const path = require(`path`)

const { traversePackagesDeps } = require(`../traverse-package-deps`)

jest.doMock(
  path.join(...`<monorepo-path>/packages/package-a/package.json`.split(`/`)),
  () => {
    return {
      dependencies: {
        "unrelated-package": `*`,
        "package-a-dep1": `*`,
      },
    }
  },
  { virtual: true }
)

jest.doMock(
  path.join(
    ...`<monorepo-path>/packages/package-a-dep1/package.json`.split(`/`)
  ),
  () => {
    return {
      dependencies: {
        "package-a-dep1-dep1": `*`,
      },
    }
  },
  { virtual: true }
)

jest.doMock(
  path.join(
    ...`<monorepo-path>/packages/package-a-dep1-dep1/package.json`.split(`/`)
  ),
  () => {
    return {
      dependencies: {},
    }
  },
  { virtual: true }
)

describe(`traversePackageDeps`, () => {
  it(`handles deep dependency chains`, () => {
    const monoRepoPackages = [
      `package-a`,
      `package-a-dep1`,
      `package-a-dep1-dep1`,
      `package-not-used`,
    ]
    const packageNameToPath = new Map()
    for (const packageName of monoRepoPackages) {
      packageNameToPath.set(
        packageName,
        path.join(...`<monorepo-path>/packages/${packageName}`.split(`/`))
      )
    }

    const { seenPackages, depTree } = traversePackagesDeps({
      root: `<monorepo-path>`,
      packages: [`package-a`, `doesnt-exist`],
      monoRepoPackages,
      packageNameToPath,
    })

    expect(seenPackages).toEqual([
      `package-a`,
      `package-a-dep1`,
      `package-a-dep1-dep1`,
    ])

    expect(depTree).toEqual({
      "package-a-dep1": new Set([`package-a`]),
      "package-a-dep1-dep1": new Set([`package-a-dep1`]),
    })
  })
})
