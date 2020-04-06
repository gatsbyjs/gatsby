const path = require('path')

const pkgJson = require(`./package-json`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(__dirname, 'fixtures')

const name = "husky"
const initialValue = {
  "hooks": {}
}
const updateValue = {
  "hooks": {
    "pre-commit": "lint-staged"
  }
}

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
})
