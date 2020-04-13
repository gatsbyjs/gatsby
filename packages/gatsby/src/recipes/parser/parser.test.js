const fs = require(`fs-extra`)
const path = require(`path`)

const parser = require(`.`)

const fixturePath = path.join(__dirname, `../mdx-src/prettier-git-hook.mdx`)
const fixtureSrc = fs.readFileSync(fixturePath, `utf8`)

test(`returns a set of commands`, async () => {
  const result = await parser.parse(fixtureSrc)

  expect(result.commands).toMatchSnapshot()
})

test(`partitions the MDX into steps`, async () => {
  const result = await parser.parse(fixtureSrc)

  expect(result.stepsAsMdx).toMatchSnapshot()
})

test(`handles imports from urls`, async () => {
  const result = await parser.parse(`
import TestRecipe from 'https://gist.githubusercontent.com/johno/20503d2a2c80529096e60cd70260c9d8/raw/0145da93c17dcbf5d819a1ef3c97fa8713fad490/test-recipe.mdx'

# Here is an imported recipe from a url!

---

<TestRecipe />
`)

  expect(result.stepsAsMdx).toMatchSnapshot()
})

test(`fetches MDX from a url`, async () => {
  const result = await parser(
    "https://gist.githubusercontent.com/johno/20503d2a2c80529096e60cd70260c9d8/raw/b082a2febcdb0b26d8a799b0c953c165d49b51b9/test-recipe.mdx"
  )

  expect(result.commands).toMatchSnapshot()
})

test(`raises an error if JSX doesn't parse`, async () => {
  try {
    await parser.parse(`# Hello, world!

---

<NPMScript name="foo" command="bar" /

`)
  } catch (e) {
    expect(e).toMatchInlineSnapshot(
      `[Error: {"location":{"line":1,"column":43},"validationError":"Could not parse \\"<NPMScript name=\\"foo\\" command=\\"bar\\" /\\""}]`
    )
  }
})
