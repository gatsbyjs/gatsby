const { execFileSync } = require(`child_process`)
const {
  copy,
  mkdirp,
  readdir,
  readFile,
  remove,
  stat,
  writeFile,
  exists,
} = require(`fs-extra`)
const { resolve, join } = require(`path`)

let basePath: string
let rootPath: string

beforeAll(async () => {
  basePath = resolve(`${__dirname}/fixtures`)
  rootPath = resolve(`${__dirname}/..`)

  await remove(basePath)

  await mkdirp(basePath)

  await copy(`${rootPath}/plugins`, `${basePath}/plugins`)
  await copy(`${rootPath}/gatsby-config.js`, `${basePath}/gatsby-config.js`)
  await copy(`${rootPath}/package.json`, `${basePath}/package.json`)
}, 1000000)

afterAll(async () => {
  // Wait to avoid `EBUSY: resource busy or locked, rmdir` on Windows
  const waitForWindowsBeingSlow = new Promise(resolve =>
    setTimeout(resolve, 600)
  )
  await waitForWindowsBeingSlow
  await remove(basePath)
})

it("should invoke pluginOptionsSchema for validating local plugin", async () => {
  execFileSync(`yarn`, [`build`], {
    cwd: basePath,
    /* stdio: "inherit", /* for debugging/verbosity */
    shell: true /* Windows-compat */,
  })

  const pluginLoadedPath = join(basePath, "public", "local-plugin-loaded")
  expect(await exists(pluginLoadedPath)).toBe(true)
  const fileBuffer = await readFile(pluginLoadedPath)
  expect(fileBuffer.toString()).toBe("VALIDATION RAN")
})
