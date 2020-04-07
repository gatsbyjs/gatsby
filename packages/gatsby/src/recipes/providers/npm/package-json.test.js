const path = require(`path`)

const pkgJson = require(`./package-json`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(__dirname, `fixtures`)

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
