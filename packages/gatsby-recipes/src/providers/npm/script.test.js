const path = require(`path`)

const script = require(`./script`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(__dirname, `fixtures`)

describe(`npm script resource`, () => {
  test(`e2e script resource test`, async () => {
    await resourceTestHelper({
      resourceModule: script,
      resourceName: `NPMScript`,
      context: { root },
      initialObject: { name: `apple`, command: `foot` },
      partialUpdate: { command: `foot2` },
    })
  })

  test(`handles multiple parallel create calls`, async () => {
    const resultPromise = script.create(
      {
        root,
      },
      {
        name: `husky`,
        command: `hi`,
      }
    )
    const result2Promise = script.create(
      {
        root,
      },
      {
        name: `husky2`,
        command: `hi`,
      }
    )

    const result = await resultPromise
    const result2 = await result2Promise

    expect(result).toMatchSnapshot()
    expect(result2).toMatchSnapshot()

    await script.destroy({ root }, result)
    await script.destroy({ root }, result2)
  })
})
