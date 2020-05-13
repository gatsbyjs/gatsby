const render = require(`.`)
const transform = require(`./transform-to-plan-structure`)

const fixture = `
Install packages and write files!

<NPMPackage name='gatsby' />

<File path='1.txt' content='1' />
<File path='2.txt' content='2' />
`

test(`transforms the render output`, async () => {
  const output = await render(fixture)

  const result = transform(output)

  expect(result.NPMPackage[0]._props.name).toEqual(`gatsby`)
  expect(result.NPMPackage[0].newState).toEqual(`gatsby@latest`)
  expect(result.File).toHaveLength(2)
})
