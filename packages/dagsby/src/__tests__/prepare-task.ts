const prepareTask = require(`../prepare-task`)
const path = require(`path`)

describe(`prepare-task`, () => {
  it(`prepares a digest of a file in tasks`, async () => {
    let task = {
      func: args => args.a,
      digest: 1,
      files: {
        test: { originPath: path.join(__dirname, `mocks`, `hello.txt`) },
      },
      args: { a: 1 },
    }

    const preparedTask = await prepareTask(task)

    expect(preparedTask).toMatchSnapshot()
    expect(preparedTask.files.test.digest).toBeTruthy()
  })
  it(`prepares a digest of multiple file in tasks`, async () => {
    let task = {
      func: args => args.a,
      digest: 2,
      files: {
        test: { originPath: path.join(__dirname, `mocks`, `hello.txt`) },
        test2: { originPath: path.join(__dirname, `mocks`, `hello2.txt`) },
      },
      args: { a: 1 },
    }

    const preparedTask = await prepareTask(task)

    expect(preparedTask).toMatchSnapshot()
    expect(preparedTask.files.test.digest).toBeTruthy()
    expect(preparedTask.files.test2.digest).toBeTruthy()
  })
})
