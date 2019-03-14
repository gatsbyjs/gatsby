const { eachPromise } = require(`../utils`)

test(`eachPromise`, async () => {
  const args = [`foo`, `bar`, `baz`]

  const cb = jest.fn()

  await eachPromise(args, arg => {
    cb(`Start`, arg)
    return new Promise(resolve => {
      setTimeout(() => {
        cb(`Finish`, arg)
        resolve()
      }, 200)
    })
  })

  expect(cb).toHaveBeenNthCalledWith(1, `Start`, `foo`)
  expect(cb).toHaveBeenNthCalledWith(2, `Finish`, `foo`)
  expect(cb).toHaveBeenNthCalledWith(3, `Start`, `bar`)
  expect(cb).toHaveBeenNthCalledWith(4, `Finish`, `bar`)
  expect(cb).toHaveBeenNthCalledWith(5, `Start`, `baz`)
  expect(cb).toHaveBeenNthCalledWith(6, `Finish`, `baz`)
})
