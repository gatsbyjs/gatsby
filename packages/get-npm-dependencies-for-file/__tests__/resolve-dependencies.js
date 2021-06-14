const findDependencies = require(`../`)
const path = require(`path`)

describe(`resolve-dependencies`, () => {
  it(`returns empty array if the file has no dependencies`, () => {
    expect(
      findDependencies(path.resolve(__dirname, `./fixtures/no-dependencies.js`))
    ).toEqual({})
  })
  it(`handles typescript files`, () => {
    expect(
      findDependencies(
        path.resolve(__dirname, `./fixtures/no-dependencies-typescript.ts`)
      )
    ).toEqual({})
  })
  it(`handles mjs files`, () => {
    expect(
      findDependencies(
        path.resolve(__dirname, `./fixtures/no-dependencies-mjs.mjs`)
      )
    ).toEqual({})
  })
  it(`returns array of package names if the file has dependencies`, () => {
    expect(
      Object.keys(
        findDependencies(
          path.resolve(__dirname, `./fixtures/one-dependency.ts`)
        )
      )[0]
    ).toEqual(`chrome-aws-lambda`)
  })
  it(`ignores local dependencies`, () => {
    expect(
      findDependencies(
        path.resolve(__dirname, `./fixtures/local-dependency.ts`)
      )
    ).toEqual({})
  })
  it(`ignores dependencies it can't resolve`, () => {
    expect(
      findDependencies(
        path.resolve(__dirname, `./fixtures/not-resolvable-dependency.ts`)
      )
    ).toEqual({})
  })
  it(`traverses the file's local dependencies`, () => {
    const dependencies = findDependencies(
      path.resolve(__dirname, `./fixtures/local-dependency-with-dependency.ts`)
    )
    expect(Object.keys(dependencies)[0]).toEqual(`chrome-aws-lambda`)
    expect(Object.values(dependencies)[0]).toBeTruthy()
  })
})
