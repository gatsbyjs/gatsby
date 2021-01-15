const setupFunctionDir = require(`../setup-function-dir`)
const os = require(`os`)
const uuid = require(`uuid`)
const path = require(`path`)
const fs = require(`fs-extra`)

describe(`setup-function-dir`, () => {
  it(`sets up a function dir`, async () => {
    const aFunction = args => args.a
    const id = uuid.v4()
    const directory = path.join(os.tmpdir(), id)
    fs.ensureDirSync(directory)
    const funcPath = path.join(directory, `index.js`)
    setupFunctionDir({
      task: {
        func: aFunction.toString(),
        digest: 1,
      },
      funcDir: directory,
      funcPath,
    })

    const funcStr = await fs.readFile(funcPath, `utf-8`)

    expect(funcStr).toEqual(`module.exports = ${aFunction.toString()}`)
  })

  it(`installs dependencies for a task`, async () => {
    const aFunction = args => args.a
    const id = uuid.v4()
    const directory = path.join(os.tmpdir(), id)
    fs.ensureDirSync(directory)
    const funcPath = path.join(directory, `index.js`)
    await setupFunctionDir({
      task: {
        func: aFunction.toString(),
        digest: 1,
        dependencies: {
          lodash: `latest`,
        },
      },
      funcDir: directory,
      funcPath,
    })

    const funcStr = await fs.readFile(funcPath, `utf-8`)
    const packageJson = await fs.readFile(
      path.join(directory, `package.json`),
      `utf-8`
    )
    const parsedJson = JSON.parse(packageJson)

    expect(funcStr).toEqual(`module.exports = ${aFunction.toString()}`)
    expect(parsedJson).toMatchSnapshot()
    expect(parsedJson.dependencies).toHaveProperty(`lodash`)
  })
})
