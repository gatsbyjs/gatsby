const fs = require(`fs-extra`)
const path = require(`path`)

const parser = require(`.`)

const fixturePath = path.join(__dirname, `fixtures/prettier-git-hook.mdx`)
const fixtureSrc = fs.readFileSync(fixturePath, `utf8`)

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
