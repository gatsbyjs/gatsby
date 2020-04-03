const path = require('path')
const pkgJson = require(`./package-json`)

const root = path.join(__dirname, 'fixtures')

const name = "husky"
const value = {
  "hooks": {
    "pre-commit": "lint-staged"
  }
}

describe('package-json', () => {
  test(`create a config object`, async () => {
    await pkgJson.create({ root }, { name, value })

    const result = await pkgJson.read({ root }, { name, value })

    expect(result).toEqual({ name, value })

    await pkgJson.destroy({ root }, { name, value })
  })
})
