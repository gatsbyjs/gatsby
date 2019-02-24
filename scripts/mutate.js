const path = require(`path`)
const fs = require(`fs`)
const glob = require(`glob`)
const Stryker = require(`@stryker-mutator/core`).default
const defaultBabelOptions = require(`../.babelrc`)
const defaultJestConfig = require(`../jest.config`)

function resolvePkg(pkg) {
  const pkgPath = path.resolve(`./packages/${pkg}`)
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`Could not find package: ${pkg}`)
  }
  return pkgPath
}

function resolveBabelRc(pkgPath) {
  if (fs.existsSync(path.join(pkgPath, `.babelrc`))) {
    return path.resolve(pkgPath, `.babelrc`)
  }
  return null
}

function resolveFilesToMutate(pkgPath) {
  const ignoredDirectories = [
    `__tests__`,
    `__testfixtures__`,
    `__mocks__`,
    `node_modules`,
    `dist`,
    `cache-dir`,
  ].join(`,`)
  const ignore = `**/{${ignoredDirectories}}/**`
  const src = path.join(pkgPath, `src`)
  const cwd = fs.existsSync(src) ? src : pkgPath
  const files = glob.sync(`**/!(lazy-fields).js`, { cwd, ignore })
  return files.map(file => path.resolve(cwd, file))
}

function resolveBabelConfig(pkgPath) {
  const optionsFile = resolveBabelRc(pkgPath)
  const options = optionsFile ? {} : defaultBabelOptions
  return {
    optionsFile,
    options: Object.assign({}, options, {
      ignore: [
        `**/node_modules/**`,
        `**/__tests__/**`,
        `**/__testfixtures__/**`,
        `**/__mocks__/**`,
        `**/dist/**`,
        `**/cache-dir/**`,
      ],
    }),
  }
}

function resolveContext(pkg, customFiles) {
  const pkgPath = resolvePkg(pkg)
  const mutate = resolveFilesToMutate(pkgPath)
  const babel = resolveBabelConfig(pkgPath)
  const files = [`${pkgPath}/**/*`, `${pkgPath}/**/.*`, `jest-transformer.js`]
  return {
    pkg,
    pkgPath,
    babel,
    mutate: customFiles
      ? mutate.filter(file => customFiles.includes(file))
      : mutate,
    files,
  }
}

function createConfig({ mutate, babel, files, pkg }) {
  return {
    mutate,
    babel,
    files,
    mutator: `javascript`,
    testRunner: `jest`,
    reporters: [`html`, `progress`],
    htmlReporter: { baseDir: `mutation/${pkg}` },
    coverageAnalysis: `off`,
    transpilers: [`babel`],
    timeoutMS: 60000,
    logLevel: `fatal`,
    jest: {
      config: Object.assign({}, defaultJestConfig, { notify: false }),
    },
  }
}

function getPackageFromPath(filePath) {
  return filePath.split(path.sep)[1]
}

async function mutate(pkg, customFiles) {
  try {
    console.log(`-> package: ${pkg}`)
    const context = resolveContext(pkg, customFiles)
    const config = createConfig(context)
    const files = context.mutate.length === 1 ? `file` : `files`
    console.log(`Found ${context.mutate.length} ${files} to mutate.`)
    const stryker = new Stryker(config)
    const result = await stryker.runMutationTest()
    if (!result.length) {
      console.log(`Found no tests covering the mutated ${files}.`)
    }
    console.log(`\n`)
  } catch (err) {
    console.log(`Error: ${err.message}\n\n`)
  }
}

async function run({ packages, customFiles }) {
  for (const pkg of packages) {
    try {
      await mutate(pkg, customFiles)
    } catch (_) {
      continue
    }
  }
  process.exit(0)
}

function help() {
  console.log(`usage:`)
  console.log(`  yarn test:ci <package>`)
  console.log(`  yarn test:ci <path> -f\n`)
  console.log(`options:`)
  console.log(`  --help, -h     print help`)
  console.log(`  --all, -a      mutate all packages`)
  console.log(`  --file, -f     mutate a single file`)
}

const args = process.argv.slice(2)
const config = { packages: args }
const packages = fs.readdirSync(`./packages`)

if (!args.length) {
  console.error(`Please specify at least one package to mutate`)
  help()
  process.exit(1)
} else if (args.includes(`--help`) || args.includes(`-h`)) {
  help()
  process.exit(0)
} else if (args.includes(`--all`) || args.includes(`-a`)) {
  config.packages = packages
} else if (args.includes(`--file`) || args.includes(`-f`)) {
  const files = args.filter(arg => arg !== `-f` && arg !== `--file`)
  config.customFiles = files.map(file => path.join(process.cwd(), file))
  config.packages = files.map(getPackageFromPath)
}

run(config)
