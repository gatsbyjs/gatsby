const path = require(`path`)

const pkgJson = require(`./package-json`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(__dirname, `fixtures`, `package-json`)

const name = `husky`
const initialValue = JSON.stringify(
  {
    hooks: {},
  },
  null,
  2
)
const updateValue = JSON.stringify(
  {
    hooks: {
      "pre-commit": `lint-staged`,
    },
  },
  null,
  2
)

describe(`packageJson resource`, () => {
  test(`e2e package resource test`, async () => {
    await resourceTestHelper({
      resourceModule: pkgJson,
      resourceName: `PackageJson`,
      context: { root },
      initialObject: { name, value: initialValue },
      partialUpdate: { value: updateValue },
    })
  })

  test(`handles multiple parallel create calls`, async () => {
    const resultPromise = pkgJson.create(
      {
        root,
      },
      {
        name: `husky`,
        value: JSON.parse(initialValue),
      }
    )
    const result2Promise = pkgJson.create(
      {
        root,
      },
      {
        name: `husky2`,
        value: JSON.parse(initialValue),
      }
    )

    const result = await resultPromise
    const result2 = await result2Promise

    expect(result).toMatchSnapshot()
    expect(result2).toMatchSnapshot()

    await pkgJson.destroy({ root }, result)
    await pkgJson.destroy({ root }, result2)
  })

  test(`handles object values`, async () => {
    const result = await pkgJson.create(
      {
        root,
      },
      {
        name,
        value: JSON.parse(initialValue),
      }
    )

    expect(result).toMatchSnapshot()

    await pkgJson.destroy({ root }, result)
  })
})
