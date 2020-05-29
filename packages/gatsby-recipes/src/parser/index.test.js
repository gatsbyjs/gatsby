const fs = require(`fs-extra`)
const path = require(`path`)

const parser = require(`.`)

const fixturePath = path.join(__dirname, `fixtures/prettier-git-hook.mdx`)
const fixtureSrc = fs.readFileSync(fixturePath, `utf8`)

// There are network calls being made and thoses tests often doesn't finish
// within default 5s timeout on CI
jest.setTimeout(100000)

test(`fetches a recipe from unpkg when official short form`, async () => {
  const result = await parser(`theme-ui`)

  expect(result.stepsAsMdx[0]).toMatch(`# Setup Theme UI`)
  expect(result.stepsAsMdx[1]).toMatch(`Install packages`)
  expect(result.stepsAsMdx[1]).toMatch(`<NPMPackage`)
  expect(result.stepsAsMdx[1]).toMatch(`_uuid="`)
})

test(`fetches a recipe from unpkg when official short form and .mdx`, async () => {
  const result = await parser(`theme-ui.mdx`)

  expect(result).toBeTruthy()
})

test(`raises an error when the recipe isn't known`, async () => {
  try {
    await parser(`theme-uiz`)
  } catch (e) {
    expect(e).toBeTruthy()
  }
})

test(`partitions the MDX into steps`, async () => {
  const result = await parser.parse(fixtureSrc)

  expect(result.stepsAsMdx[0]).toMatch(
    `# Automatically run Prettier on Git commits`
  )
  expect(result.stepsAsMdx[1]).toMatch(`<NPMPackage`)
  expect(result.stepsAsMdx[2]).toMatch(`<NPMPackageJson`)
  expect(result.stepsAsMdx[3]).toMatch(`<File`)
})

test(`raises an error if JSX doesn't parse`, async () => {
  try {
    await parser.parse(`# Hello, world!
---
<NPMScript name="foo" command="bar" /
`)
  } catch (e) {
    expect(e).toBeTruthy()
  }
})
