const file = require(`./file`)

const root = __dirname
const content = `Hello, world!`

test(`create writes a file`, async () => {
  const filePath = `bar.txt`

  await file.create({ root }, { path: filePath, content })

  const result = await file.read({ root }, { path: filePath })

  expect(result.content).toEqual(content)

  await file.destroy({ root }, { path: filePath })
})

test(`update overwrites a file`, async () => {
  const filePath = `bar.txt`
  const newContent = `new content!`

  await file.create({ root }, { path: filePath, content })
  await file.update({ root }, { path: filePath, content: newContent })

  const result = await file.read({ root }, { path: filePath })

  expect(result.content).toEqual(newContent)

  await file.destroy({ root }, { path: filePath })
})
