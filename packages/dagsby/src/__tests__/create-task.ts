import createTask from "../create-task"
import path from "path"

describe(`create task`, () => {
  it(`creates a simple task`, async () => {
    const task = await createTask({
      func: args => `hello ${args.name}!`,
      argsSchema: [
        {
          name: `name`,
          type: `string`,
        },
      ],
    })

    expect(typeof task.func).toBe(`string`)
    expect(typeof task.funcDigest).toBe(`number`)
    expect(typeof task.digest).toBe(`number`)

    console.log(task)
    expect(task).toMatchSnapshot()
  })

  it(`creates a simple task with files`, async () => {
    const task = await createTask({
      func: args => `hello ${args.name}!`,
      argsSchema: [
        {
          name: `name`,
          type: `string`,
        },
      ],
      files: {
        text: {
          originPath: path.join(__dirname, `mocks`, `hello.txt`),
        },
      },
      dependencies: {
        lodash: `latest`,
      },
    })

    console.log(task)
    expect(typeof task.files.text.digest).toBe(`string`)

    expect(task).toMatchSnapshot()
  })
})
