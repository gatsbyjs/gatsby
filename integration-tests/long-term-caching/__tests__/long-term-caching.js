const {
  copy,
  mkdirp,
  move,
  readdir,
  readFile,
  remove,
  stat,
  writeFile,
} = require(`fs-extra`)
const { resolve } = require(`path`)
const { execFile } = require(`child_process`)
const { promisify } = require(`util`)

const execFileAsync = promisify(execFile)

const getDirFilesWalk = async dir => {
  const dirFiles = await readdir(dir)

  const additionalFiles = [].concat(
    ...(await Promise.all(
      dirFiles.map(async file => {
        const filePath = `${dir}/${file}`
        const fileStat = await stat(filePath)

        if (fileStat.isDirectory()) {
          return await getDirFilesWalk(filePath)
        }
        return undefined
      })
    )).filter(Boolean)
  )

  return [...dirFiles, ...additionalFiles]
}

describe(`long term caching`, () => {
  let basePath
  let rootPath
  let srcPath
  let pagesPath

  const createPublic0 = async () => {
    await execFileAsync(`yarn`, [`build`], { cwd: basePath })
    move(`${basePath}/public`, `${basePath}/public-0`)
  }

  const createPublic1 = async () => {
    const indexPath = `${rootPath}/src/pages/index.js`
    const data = await readFile(indexPath, `utf8`)
    const regex = /!/

    const modifiedData = data.replace(regex, `?`)
    await writeFile(`${pagesPath}/index.js`, modifiedData)

    await execFileAsync(`yarn`, [`build`], { cwd: basePath })
    await move(`${basePath}/public`, `${basePath}/public-1`)
  }

  const createPublic2 = async () => {
    const indexPath = `${rootPath}/src/pages/index.js`
    const data = await readFile(indexPath, `utf8`)

    const import1 = `import gray from "gray-percentage"`

    const modifiedData = `${import1}\n${data}`
    await writeFile(`${pagesPath}/index.js`, modifiedData)

    await execFileAsync(`yarn`, [`build`], { cwd: basePath })
    await move(`${basePath}/public`, `${basePath}/public-2`)
  }

  const createPublic3 = async () => {
    const indexPath = `${rootPath}/src/pages/index.js`
    const data = await readFile(indexPath, `utf8`)

    const import1 = `import('../async')`

    const modifiedData = `${import1}\n${data}`
    await writeFile(`${pagesPath}/index.js`, modifiedData)

    await execFileAsync(`yarn`, [`build`], { cwd: basePath })
    await move(`${basePath}/public`, `${basePath}/public-3`)
  }

  const createPublic4 = async () => {
    const indexPath = `${rootPath}/src/pages/index.js`
    const data = await readFile(indexPath, `utf8`)

    const import1 = `import('../async')`
    const import2 = `import('../async-2')`

    const modifiedData = `${import1}\n${import2}\n${data}`
    await writeFile(`${pagesPath}/index.js`, modifiedData)

    await execFileAsync(`yarn`, [`build`], { cwd: basePath })
    await move(`${basePath}/public`, `${basePath}/public-4`)
  }

  const createPublic5 = async () => {
    const indexPath = `${rootPath}/src/async-2.js`
    const data = await readFile(indexPath, `utf8`)
    const regex = /2/

    const modifiedData = data.replace(regex, `?`)
    await writeFile(`${srcPath}/async-2.js`, modifiedData)

    await execFileAsync(`yarn`, [`build`], { cwd: basePath })
    await move(`${basePath}/public`, `${basePath}/public-5`)
  }

  beforeAll(async () => {
    basePath = resolve(`${__dirname}/base`)
    rootPath = resolve(`${__dirname}/..`)

    await mkdirp(basePath)

    await copy(`${rootPath}/src`, `${basePath}/src`)
    await copy(`${rootPath}/package.json`, `${basePath}/package.json`)

    srcPath = resolve(`${basePath}/src`)
    pagesPath = resolve(`${srcPath}/pages`)

    await execFileAsync(`yarn`, [], { cwd: basePath })

    await createPublic0()
    await createPublic1()
    await createPublic2()
    await createPublic3()
    await createPublic4()
    await createPublic5()
  }, 100000)

  afterAll(async () => {
    await remove(basePath)
  })

  test(`Add character to src/pages/index.js`, async () => {
    const public0 = resolve(`${basePath}/public-0`)
    const public1 = resolve(`${basePath}/public-1`)

    const originalFiles = await getDirFilesWalk(public0)
    const changedFiles = await getDirFilesWalk(public1)
    expect(originalFiles).not.toEqual(expect.arrayContaining(changedFiles))
  })

  test(`Add import to src/pages/index.js`, async () => {
    const public0 = resolve(`${basePath}/public-0`)
    const public2 = resolve(`${basePath}/public-2`)

    const originalFiles = await getDirFilesWalk(public0)
    const changedFiles = await getDirFilesWalk(public2)
    expect(originalFiles).not.toEqual(expect.arrayContaining(changedFiles))
  })

  test(`Add async import to src/pages/index.js`, async () => {
    const public0 = resolve(`${basePath}/public-0`)
    const public3 = resolve(`${basePath}/public-3`)

    const originalFiles = await getDirFilesWalk(public0)
    const changedFiles = await getDirFilesWalk(public3)
    expect(originalFiles).not.toEqual(expect.arrayContaining(changedFiles))
  })

  test(`Add another async import to src/pages/index.js`, async () => {
    const public0 = resolve(`${basePath}/public-0`)
    const public4 = resolve(`${basePath}/public-4`)

    const originalFiles = await getDirFilesWalk(public0)
    const changedFiles = await getDirFilesWalk(public4)
    expect(originalFiles).not.toEqual(expect.arrayContaining(changedFiles))
  })

  test(`Add character to src/async-2.js`, async () => {
    const public0 = resolve(`${basePath}/public-0`)
    const public5 = resolve(`${basePath}/public-5`)

    const originalFiles = await getDirFilesWalk(public0)
    const changedFiles = await getDirFilesWalk(public5)
    expect(originalFiles).not.toEqual(expect.arrayContaining(changedFiles))
  })
})
