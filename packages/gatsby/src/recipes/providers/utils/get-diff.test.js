const getDiff = require(`./get-diff`)

const oldString = `
pizza
super
duper
`

const newString = `
pizza

duper
`

it(`diffs strings by line with color codes`, async () => {
  const result = await getDiff(oldString, newString)
  expect(result).toMatchSnapshot()
})
