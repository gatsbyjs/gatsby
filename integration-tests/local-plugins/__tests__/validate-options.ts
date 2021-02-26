const { execFileSync } = require(`child_process`)
const {
  copy,
  mkdirp,
  readdir,
  readFile,
  remove,
  stat,
  writeFile,
  exists
} = require(`fs-extra`)
const { resolve, join } = require(`path`)

let basePath: string;
let rootPath: string;

beforeAll(async () => {
  basePath = resolve(`${__dirname}/base`)
  rootPath = resolve(`${__dirname}/..`)

  await remove(basePath)

  await mkdirp(basePath)

  await copy(`${rootPath}/plugins`, `${basePath}/plugins`)
  await copy(`${rootPath}/gatsby-config.js`, `${basePath}/gatsby-config.js`)
  await copy(`${rootPath}/package.json`, `${basePath}/package.json`)
}, 1000000)

afterAll(async () => {
  await remove(basePath)
})

it('should validate local plugin options schema', async () => {
  execFileSync(`yarn`, [`build`], { cwd: basePath, stdio: 'inherit', shell: true })

  const pluginLoadedPath = join(basePath, 'public', 'local-plugin-loaded');
  expect(await exists(pluginLoadedPath)).toBe(true);
  const contents = await readFile(pluginLoadedPath)
  expect(contents.toString()).toBe('true');
})