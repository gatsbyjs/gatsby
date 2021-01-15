const os = require(`os`)
const uuid = require(`uuid`)
const path = require(`path`)
const fs = require(`fs-extra`)

const makeTmpDirectory = () => {
  const id = uuid.v4()
  const directory = path.join(os.tmpdir(), id)
  fs.ensureDirSync(directory)

  return directory
}

describe(`setup-function-dir`, () => {
  beforeEach(() => {
    jest.mock("execa", () => {
      const real = jest.requireActual("execa")

      return jest.fn(real)
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it(`sets up a function dir`, async () => {
    const setupFunctionDir = require(`../setup-function-dir`)
    const aFunction = args => args.a
    const { funcPath } = await setupFunctionDir({
      task: {
        func: aFunction.toString(),
        digest: 1,
      },
      emit: () => {},
      functionDir: makeTmpDirectory(),
    })

    const funcStr = await fs.readFile(funcPath, `utf-8`)

    expect(funcStr).toEqual(`module.exports = ${aFunction.toString()}`)
  })

  it(`installs dependencies for a task`, async () => {
    const setupFunctionDir = require(`../setup-function-dir`)
    const aFunction = args => args.a
    const functionDir = makeTmpDirectory()
    const { funcPath, funcDir } = await setupFunctionDir({
      task: {
        func: aFunction.toString(),
        digest: 1,
        dependencies: {
          lodash: `latest`,
        },
      },
      emit: () => {},
      functionDir,
    })

    const funcStr = await fs.readFile(funcPath, `utf-8`)
    const packageJson = await fs.readFile(
      path.join(funcDir, `package.json`),
      `utf-8`
    )
    const parsedJson = JSON.parse(packageJson)
    delete parsedJson.name

    expect(funcStr).toEqual(`module.exports = ${aFunction.toString()}`)
    expect(parsedJson).toMatchSnapshot()
    expect(parsedJson.dependencies).toHaveProperty(`lodash`)
  })

  it(`installs dependencies only once when multiple workers try to setup a directory`, async () => {
    const setupFunctionDir = require(`../setup-function-dir`)
    const { EventEmitter } = require("events")
    const parentMessages = new EventEmitter()
    const aFunction = args => args.a
    const functionDir = makeTmpDirectory()
    const emit = msg => parentMessages.emit(msg.msg)

    const [{ funcPath, funcDir }] = await Promise.all([
      setupFunctionDir({
        task: {
          func: aFunction.toString(),
          digest: 1,
          dependencies: {
            lodash: `latest`,
          },
        },
        functionDir,
        parentMessages,
        emit,
      }),
      setupFunctionDir({
        task: {
          func: aFunction.toString(),
          digest: 1,
          dependencies: {
            lodash: `latest`,
          },
        },
        functionDir,
        parentMessages,
        emit,
      }),
    ])

    const funcStr = await fs.readFile(funcPath, `utf-8`)
    const packageJson = await fs.readFile(
      path.join(funcDir, `package.json`),
      `utf-8`
    )
    const parsedJson = JSON.parse(packageJson)
    delete parsedJson.name

    const execa = require(`execa`)
    expect(execa).toHaveBeenCalledTimes(2)
    expect(funcStr).toEqual(`module.exports = ${aFunction.toString()}`)
    expect(parsedJson).toMatchSnapshot()
    expect(parsedJson.dependencies).toHaveProperty(`lodash`)
  })
})
