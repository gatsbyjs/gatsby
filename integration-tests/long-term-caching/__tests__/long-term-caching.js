const {
  copy,
  mkdirp,
  readdir,
  readFile,
  remove,
  stat,
  writeFile,
} = require(`fs-extra`)
const { resolve } = require(`path`)
const { execFileSync } = require(`child_process`)

const getDirFilesWalk = async dir => {
  const dirFiles = await readdir(dir)

  const additionalFiles = [].concat(
    ...(
      await Promise.all(
        dirFiles.map(async file => {
          const filePath = `${dir}/${file}`
          const fileStat = await stat(filePath)

          if (fileStat.isDirectory()) {
            return await getDirFilesWalk(filePath)
          }
          return undefined
        })
      )
    ).filter(Boolean)
  )

  return [...dirFiles, ...additionalFiles]
}

describe(`long term caching`, () => {
  let basePath
  let rootPath
  let srcPath
  let pagesPath

  const createPublic0 = async () => {
    execFileSync(`yarn`, [`build`], { cwd: basePath })
    return copy(`${basePath}/public`, `${basePath}/public-0`)
  }

  const createPublic1 = async () => {
    const indexPath = `${rootPath}/src/pages/index.js`
    const data = await readFile(indexPath, `utf8`)
    const regex = /!/

    const modifiedData = data.replace(regex, `?`)
    await writeFile(`${pagesPath}/index.js`, modifiedData)

    execFileSync(`yarn`, [`build`], { cwd: basePath })
    return copy(`${basePath}/public`, `${basePath}/public-1`)
  }

  const createPublic2 = async () => {
    const indexPath = `${rootPath}/src/pages/index.js`
    const data = await readFile(indexPath, `utf8`)

    const import1 = `import gray from "gray-percentage"`

    const modifiedData = `${import1}\n${data}`
    await writeFile(`${pagesPath}/index.js`, modifiedData)

    execFileSync(`yarn`, [`build`], { cwd: basePath })
    return copy(`${basePath}/public`, `${basePath}/public-2`)
  }

  const createPublic3 = async () => {
    const indexPath = `${rootPath}/src/pages/index.js`
    const data = await readFile(indexPath, `utf8`)

    const import1 = `import('../async')`

    const modifiedData = `${import1}\n${data}`
    await writeFile(`${pagesPath}/index.js`, modifiedData)

    execFileSync(`yarn`, [`build`], { cwd: basePath })
    return copy(`${basePath}/public`, `${basePath}/public-3`)
  }

  const createPublic4 = async () => {
    const indexPath = `${rootPath}/src/pages/index.js`
    const data = await readFile(indexPath, `utf8`)

    const import1 = `import('../async')`
    const import2 = `import('../async-2')`

    const modifiedData = `${import1}\n${import2}\n${data}`
    await writeFile(`${pagesPath}/index.js`, modifiedData)

    execFileSync(`yarn`, [`build`], { cwd: basePath })
    return copy(`${basePath}/public`, `${basePath}/public-4`)
  }

  const createPublic5 = async () => {
    const indexPath = `${rootPath}/src/async-2.js`
    const data = await readFile(indexPath, `utf8`)
    const regex = /2/

    const modifiedData = data.replace(regex, `?`)
    await writeFile(`${srcPath}/async-2.js`, modifiedData)

    execFileSync(`yarn`, [`build`], { cwd: basePath })
    return copy(`${basePath}/public`, `${basePath}/public-5`)
  }

  beforeAll(async () => {
    basePath = resolve(`${__dirname}/base`)
    rootPath = resolve(`${__dirname}/..`)

    await remove(basePath)

    await mkdirp(basePath)

    await copy(`${rootPath}/src`, `${basePath}/src`)
    await copy(`${rootPath}/package.json`, `${basePath}/package.json`)

    srcPath = resolve(`${basePath}/src`)
    pagesPath = resolve(`${srcPath}/pages`)

    await createPublic0()
    await createPublic1()
    await createPublic2()
    await createPublic3()
    await createPublic4()
    await createPublic5()
  }, 1000000)

  afterAll(async () => {
    await remove(basePath)
  })

  test(`Add character to src/pages/index.js`, async () => {
    const public0 = resolve(`${basePath}/public-0`)
    const public1 = resolve(`${basePath}/public-1`)

    const previousFiles = await getDirFilesWalk(public0)
    const modifiedFiles = await getDirFilesWalk(public1)
    expect(previousFiles).not.toEqual(expect.arrayContaining(modifiedFiles))
  })

  test(`Add import to src/pages/index.js`, async () => {
    const public1 = resolve(`${basePath}/public-1`)
    const public2 = resolve(`${basePath}/public-2`)

    const previousFiles = await getDirFilesWalk(public1)
    const modifiedFiles = await getDirFilesWalk(public2)
    expect(previousFiles).not.toEqual(expect.arrayContaining(modifiedFiles))
  })

  test(`Add async import to src/pages/index.js`, async () => {
    const public2 = resolve(`${basePath}/public-2`)
    const public3 = resolve(`${basePath}/public-3`)

    const previousFiles = await getDirFilesWalk(public2)
    const modifiedFiles = await getDirFilesWalk(public3)
    expect(previousFiles).not.toEqual(expect.arrayContaining(modifiedFiles))
  })

  test(`Add another async import to src/pages/index.js`, async () => {
    const public3 = resolve(`${basePath}/public-3`)
    const public4 = resolve(`${basePath}/public-4`)

    const previousFiles = await getDirFilesWalk(public3)
    const modifiedFiles = await getDirFilesWalk(public4)
    expect(previousFiles).not.toEqual(expect.arrayContaining(modifiedFiles))
  })

  test(`Add character to src/async-2.js`, async () => {
    const public4 = resolve(`${basePath}/public-4`)
    const public5 = resolve(`${basePath}/public-5`)

    const previousFiles = await getDirFilesWalk(public4)
    const modifiedFiles = await getDirFilesWalk(public5)
    expect(previousFiles).not.toEqual(expect.arrayContaining(modifiedFiles))
  })
})
