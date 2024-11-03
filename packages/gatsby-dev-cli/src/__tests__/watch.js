jest.mock(`chokidar`, () => {
  return {
    watch: jest.fn(),
  }
})
jest.mock(`fs-extra`, () => {
  return {
    copy: jest.fn(),
    existsSync: jest.fn(),
    removeSync: jest.fn(),
    readdirSync: jest.fn((...args) => {
      const realFs = jest.requireActual(`fs-extra`)
      return realFs.readdirSync(...args)
    }),
  }
})

jest.mock(`del`, () => jest.fn())

jest.mock(`verdaccio`, () => {
  return {
    default: (_, _2, _3, _4, _5, callback) => {
      callback(
        {
          listen: (_, _2, cb2) => {
            cb2()
          },
        },
        {
          port: `aa`,
          path: `bb`,
          host: `cc,`,
        }
      )
    },
  }
})

jest.mock(
  `${process.cwd()}/packages/gatsby-parcel-namer-relative-to-cwd/package.json`,
  () => {
    return {
      name: `@gatsbyjs/parcel-namer-relative-to-cwd/package.json`,
      version: `0.0.1`,
    }
  },
  { virtual: true }
)

const chokidar = require(`chokidar`)
const fs = require(`fs-extra`)
const path = require(`path`)
const watch = require(`../watch`)

let on
beforeEach(() => {
  fs.copy.mockReset()
  fs.existsSync.mockImplementation(() => true)
  chokidar.watch.mockImplementation(() => {
    const mock = {
      on: jest.fn().mockImplementation(() => mock),
    }
    on = mock.on
    return mock
  })
})

// get list of packages from monorepo
const packageNameToPath = new Map()
const monoRepoPackages = fs
  .readdirSync(path.join(process.cwd(), `packages`))
  .map(dirName => {
    try {
      const localPkg = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), `packages`, dirName, `package.json`)
        )
      )

      if (localPkg?.name) {
        packageNameToPath.set(
          localPkg.name,
          path.join(process.cwd(), `packages`, dirName)
        )
        return localPkg.name
      }
    } catch (error) {
      // fallback to generic one
    }

    packageNameToPath.set(
      dirName,
      path.join(process.cwd(), `packages`, dirName)
    )
    return dirName
  })

const args = [
  process.cwd(),
  [`gatsby`],
  {
    localPackages: [`gatsby`],
    monoRepoPackages,
    packageNameToPath,
  },
]

const callEventCallback = (...args) =>
  on && on.mock.calls[0].slice(-1).pop()(...args)
const callReadyCallback = (...args) =>
  on && on.mock.calls[1].slice(-1).pop()(...args)

describe(`watching`, () => {
  it(`watches files`, () => {
    watch(...args)
    expect(chokidar.watch).toHaveBeenCalledTimes(1)
    expect(chokidar.watch).toHaveBeenCalledWith(expect.any(Array), {
      ignored: [expect.any(Function)],
    })
  })

  it(`registers on handlers`, () => {
    watch(...args)

    expect(on).toHaveBeenCalledTimes(2)
    expect(on).toHaveBeenLastCalledWith(`ready`, expect.any(Function))
  })

  describe(`copying files`, () => {
    it(`does not copy files on non-watch event`, () => {
      watch(...args)

      callEventCallback(`test`)

      expect(fs.copy).not.toHaveBeenCalled()
    })

    it(`it doesn't copy files before ready event`, async () => {
      const filePath = path.join(process.cwd(), `packages/gatsby/dist/index.js`)
      watch(...args)
      await callEventCallback(`add`, filePath)

      expect(fs.copy).toHaveBeenCalledTimes(0)
    })

    it(`copies files after ready event`, async () => {
      const filePath = path.join(process.cwd(), `packages/gatsby/dist/index.js`)
      watch(...args)
      await callEventCallback(`add`, filePath)
      await callReadyCallback()

      expect(fs.copy).toHaveBeenCalledTimes(1)
      expect(fs.copy).toHaveBeenCalledWith(
        filePath,
        path.join(`node_modules`, `gatsby`, `dist`, `index.js`),
        expect.any(Function)
      )
    })

    it(`copies cache-dir files`, async () => {
      watch(...args)

      const filePath = path.join(
        process.cwd(),
        `packages/gatsby/cache-dir/register-service-worker.js`
      )
      await callEventCallback(`add`, filePath)
      await callReadyCallback()

      expect(fs.copy).toHaveBeenCalledTimes(2)
      expect(fs.copy).toHaveBeenLastCalledWith(
        filePath,
        path.join(`.cache`, `register-service-worker.js`),
        expect.any(Function)
      )
    })

    it(`filters non-existent files/directories`, () => {
      fs.existsSync.mockReset().mockImplementation(file => false)

      watch(...args)

      expect(chokidar.watch).toHaveBeenCalledWith([], expect.any(Object))
    })

    it(`filters duplicate directories`, () => {
      watch(process.cwd(), [`gatsby`, `gatsby`], {
        ...args[2],
        localPackages: [`gatsby`],
      })

      expect(chokidar.watch).toHaveBeenCalledWith(
        [expect.stringContaining(`gatsby`)],
        expect.any(Object)
      )
    })
  })

  describe(`exiting`, () => {
    let realProcess
    beforeAll(() => {
      realProcess = global.process

      global.process = {
        ...realProcess,
        exit: jest.fn(),
      }
    })

    afterAll(() => {
      global.process = realProcess
    })

    it(`does not exit if scanOnce is not defined`, async () => {
      watch(...args)
      await callReadyCallback()

      expect(process.exit).not.toHaveBeenCalled()
    })

    it(`exits if scanOnce is defined`, async () => {
      watch(process.cwd(), [`gatsby`], {
        ...args[2],
        scanOnce: true,
        localPackages: [`gatsby`],
      })

      await callReadyCallback()

      expect(process.exit).toHaveBeenCalledTimes(1)
    })
  })
})

const mockDepsChanges =
  packagesWithChangedDeps =>
  ({ packageName }) =>
    Promise.resolve({
      didDepsChanged: packagesWithChangedDeps.includes(packageName),
    })

jest.mock(`../utils/check-deps-changes`, () => {
  return {
    checkDepsChanges: jest.fn(),
  }
})

jest.mock(`../local-npm-registry/publish-package`, () => {
  return {
    publishPackage: jest.fn(),
  }
})

jest.mock(`../local-npm-registry/install-packages`, () => {
  return {
    installPackages: jest.fn(),
  }
})

jest.mock(`../utils/promisified-spawn`, () => {
  return {
    promisifiedSpawn: jest.fn(() => Promise.resolve()),
    setDefaultSpawnStdio: jest.fn(),
  }
})

describe(`dependency changes`, () => {
  const monoRepoPackages = [
    `@gatsbyjs/parcel-namer-relative-to-cwd`,
    `babel-plugin-optimize-hook-destructuring`,
    `babel-plugin-remove-graphql-queries`,
    `babel-preset-gatsby`,
    `babel-preset-gatsby-package`,
    `cypress-gatsby`,
    `gatsby`,
    `gatsby-cli`,
    `gatsby-codemods`,
    `gatsby-cypress`,
    `gatsby-dev-cli`,
    `gatsby-image`,
    `gatsby-link`,
    `gatsby-parcel-config`,
    `gatsby-plugin-canonical-urls`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-coffeescript`,
    `gatsby-plugin-cxs`,
    `gatsby-plugin-emotion`,
    `gatsby-plugin-facebook-analytics`,
    `gatsby-plugin-feed`,
    `gatsby-plugin-flow`,
    `gatsby-plugin-fullstory`,
    `gatsby-plugin-glamor`,
    `gatsby-plugin-google-analytics`,
    `gatsby-plugin-google-gtag`,
    `gatsby-plugin-google-tagmanager`,
    `gatsby-plugin-guess-js`,
    `gatsby-plugin-jss`,
    `gatsby-plugin-layout`,
    `gatsby-plugin-less`,
    `gatsby-plugin-lodash`,
    `gatsby-plugin-manifest`,
    `gatsby-plugin-netlify`,
    `gatsby-plugin-netlify-cms`,
    `gatsby-plugin-no-sourcemaps`,
    `gatsby-plugin-nprogress`,
    `gatsby-plugin-offline`,
    `gatsby-plugin-page-creator`,
    `gatsby-plugin-postcss`,
    `gatsby-plugin-preact`,
    `gatsby-plugin-react-css-modules`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-remove-trailing-slashes`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-styled-jsx`,
    `gatsby-plugin-styletron`,
    `gatsby-plugin-stylus`,
    `gatsby-plugin-subfont`,
    `gatsby-plugin-twitter`,
    `gatsby-plugin-typescript`,
    `gatsby-plugin-typography`,
    `gatsby-react-router-scroll`,
    `gatsby-remark-autolink-headers`,
    `gatsby-remark-code-repls`,
    `gatsby-remark-copy-linked-files`,
    `gatsby-remark-custom-blocks`,
    `gatsby-remark-embed-snippet`,
    `gatsby-remark-graphviz`,
    `gatsby-remark-images`,
    `gatsby-remark-images-contentful`,
    `gatsby-remark-katex`,
    `gatsby-remark-prismjs`,
    `gatsby-remark-responsive-iframe`,
    `gatsby-remark-smartypants`,
    `gatsby-source-contentful`,
    `gatsby-source-drupal`,
    `gatsby-source-faker`,
    `gatsby-source-filesystem`,
    `gatsby-source-graphql`,
    `gatsby-source-hacker-news`,
    `gatsby-source-lever`,
    `gatsby-source-medium`,
    `gatsby-source-mongodb`,
    `gatsby-source-npm-package-search`,
    `gatsby-source-shopify`,
    `gatsby-source-wikipedia`,
    `gatsby-source-wordpress`,
    `gatsby-theme-blog`,
    `gatsby-theme-blog-core`,
    `gatsby-theme-notes`,
    `gatsby-transformer-asciidoc`,
    `gatsby-transformer-csv`,
    `gatsby-transformer-documentationjs`,
    `gatsby-transformer-excel`,
    `gatsby-transformer-hjson`,
    `gatsby-transformer-javascript-frontmatter`,
    `gatsby-transformer-javascript-static-exports`,
    `gatsby-transformer-json`,
    `gatsby-transformer-pdf`,
    `gatsby-transformer-react-docgen`,
    `gatsby-transformer-remark`,
    `gatsby-transformer-screenshot`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-sqip`,
    `gatsby-transformer-toml`,
    `gatsby-transformer-xml`,
    `gatsby-transformer-yaml`,
  ]

  const packageNameToPath = new Map()
  for (const packageName of monoRepoPackages) {
    if (packageName === `@gatsbyjs/parcel-namer-relative-to-cwd`) {
      packageNameToPath.set(
        packageName,
        path.join(process.cwd(), `packages/gatsby-parcel-namer-relative-to-cwd`)
      )
    } else {
      packageNameToPath.set(
        packageName,
        path.join(process.cwd(), `packages/${packageName}`)
      )
    }
  }

  const { publishPackage } = require(`../local-npm-registry/publish-package`)
  const { installPackages } = require(`../local-npm-registry/install-packages`)
  const { checkDepsChanges } = require(`../utils/check-deps-changes`)
  const { promisifiedSpawn } = require(`../utils/promisified-spawn`)

  const assertPublish = ({ include = [], exclude = [] }) => {
    include.forEach(includedPackage => {
      expect(publishPackage).toBeCalledWith(
        expect.objectContaining({
          packageName: includedPackage,
        })
      )
    })

    exclude.forEach(excludedPackage => {
      expect(publishPackage).not.toBeCalledWith(
        expect.objectContaining({
          packageName: excludedPackage,
        })
      )
    })
  }

  const assertInstall = ({ include = [], exclude = [] }) => {
    include.forEach(includedPackage => {
      expect(installPackages).toBeCalledWith(
        expect.objectContaining({
          packagesToInstall: expect.arrayContaining([includedPackage]),
        })
      )
    })

    exclude.forEach(excludedPackage => {
      expect(installPackages).not.toBeCalledWith(
        expect.objectContaining({
          packagesToInstall: expect.arrayContaining([excludedPackage]),
        })
      )
    })
  }

  const assertCopy = packages => {
    packages.forEach(pkgName => {
      expect(fs.copy).toBeCalledWith(
        expect.stringContaining(path.join(`packages`, pkgName)),
        expect.stringContaining(path.join(`node_modules`, pkgName)),
        expect.anything()
      )
    })
  }

  let realProcess
  beforeAll(() => {
    realProcess = global.process

    global.process = {
      ...realProcess,
      exit: jest.fn(),
    }
  })

  beforeEach(() => {
    publishPackage.mockClear()
    installPackages.mockClear()
    checkDepsChanges.mockClear()
    promisifiedSpawn.mockClear()
  })

  afterAll(() => {
    global.process = realProcess
  })

  describe(`publishing and installing packages`, () => {
    it(`watching gatsby installs gatsby`, async () => {
      checkDepsChanges.mockImplementationOnce(mockDepsChanges([`gatsby`]))

      watch(process.cwd(), [`gatsby`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [`gatsby`, `gatsby-plugin-sharp`],
      })

      const filePath = path.join(process.cwd(), `packages/gatsby/package.json`)
      await callEventCallback(`add`, filePath)
      await callReadyCallback()

      assertPublish({
        include: [`gatsby`],
        exclude: [`gatsby-plugin-sharp`],
      })

      assertInstall({
        include: [`gatsby`],
        exclude: [`gatsby-cli`, `gatsby-plugin-sharp`],
      })
    })

    it(`watching gatsby and gatsby-plugin-sharp installs gatsby and copies gatsby-plugin-sharp`, async () => {
      checkDepsChanges.mockImplementationOnce(mockDepsChanges([`gatsby`]))

      watch(process.cwd(), [`gatsby`, `gatsby-plugin-sharp`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [`gatsby`, `gatsby-plugin-sharp`],
      })

      const filePath = path.join(process.cwd(), `packages/gatsby/package.json`)
      await callEventCallback(`add`, filePath)
      // no deps changes in gatsby-plugin-sharp, just copy files over
      await callEventCallback(
        `add`,
        path.join(process.cwd(), `packages/gatsby-plugin-sharp/index.js`)
      )
      await callReadyCallback()

      assertPublish({
        include: [`gatsby`],
        exclude: [`gatsby-plugin-sharp`],
      })

      assertInstall({
        include: [`gatsby`],
        exclude: [`gatsby-cli`, `gatsby-plugin-sharp`],
      })

      assertCopy([`gatsby`, `gatsby-plugin-sharp`])
    })

    it(`watching gatsby-cli installs gatsby`, async () => {
      checkDepsChanges.mockImplementationOnce(mockDepsChanges([`gatsby-cli`]))

      watch(process.cwd(), [`gatsby-cli`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [`gatsby`, `gatsby-plugin-sharp`],
      })

      const filePath = path.join(
        process.cwd(),
        `packages/gatsby-cli/package.json`
      )
      await callEventCallback(`add`, filePath)
      await callReadyCallback()

      assertPublish({
        include: [`gatsby`, `gatsby-cli`],
        exclude: [`gatsby-plugin-sharp`],
      })

      assertInstall({
        include: [`gatsby`],
        exclude: [`gatsby-cli`, `gatsby-plugin-sharp`],
      })
    })

    it(`watching gatsby-source-filesystem and having gatsby-source-wordpress installs gatsby-source-wordpress`, async () => {
      checkDepsChanges.mockImplementationOnce(
        mockDepsChanges([`gatsby-source-filesystem`])
      )

      watch(process.cwd(), [`gatsby-source-filesystem`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [
          `gatsby`,
          `gatsby-source-wordpress`,
          `gatsby-plugin-sharp`,
        ],
      })

      const filePath = path.join(
        process.cwd(),
        `packages/gatsby-source-filesystem/package.json`
      )
      await callEventCallback(`add`, filePath)
      await callReadyCallback()

      assertPublish({
        include: [`gatsby-source-wordpress`, `gatsby-source-filesystem`],
        exclude: [`gatsby`, `gatsby-plugin-sharp`],
      })

      assertInstall({
        include: [`gatsby-source-wordpress`],
        exclude: [`gatsby`, `gatsby-source-filesystem`, `gatsby-plugin-sharp`],
      })
    })

    it(`watching gatsby-source-filesystem and having gatsby-source-filesystem installs gatsby-source-filesystem`, async () => {
      checkDepsChanges.mockImplementationOnce(
        mockDepsChanges([`gatsby-source-filesystem`])
      )

      watch(process.cwd(), [`gatsby-source-filesystem`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [
          `gatsby`,
          `gatsby-source-filesystem`,
          `gatsby-plugin-sharp`,
        ],
      })

      const filePath = path.join(
        process.cwd(),
        `packages/gatsby-source-filesystem/package.json`
      )
      await callEventCallback(`add`, filePath)
      await callReadyCallback()

      assertPublish({
        include: [`gatsby-source-filesystem`],
        exclude: [`gatsby`, `gatsby-plugin-sharp`],
      })

      assertInstall({
        include: [`gatsby-source-filesystem`],
        exclude: [`gatsby`, `gatsby-plugin-sharp`],
      })
    })

    it(`watching gatsby-source-filesystem and not having gatsby-source-filesystem or gatsby-source-wordpress, installs nothing`, async () => {
      checkDepsChanges.mockImplementationOnce(
        mockDepsChanges([`gatsby-source-filesystem`])
      )

      watch(process.cwd(), [`gatsby-source-filesystem`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [`gatsby`, `gatsby-plugin-sharp`],
      })

      const filePath = path.join(
        process.cwd(),
        `packages/gatsby-source-filesystem/package.json`
      )
      await callEventCallback(`add`, filePath)
      await callReadyCallback()

      assertPublish({
        include: [],
        exclude: [
          `gatsby`,
          `gatsby-source-filesystem`,
          `gatsby-source-wordpress`,
          `gatsby-plugin-sharp`,
        ],
      })

      assertInstall({
        include: [],
        exclude: [
          `gatsby`,
          `gatsby-source-filesystem`,
          `gatsby-source-wordpress`,
          `gatsby-plugin-sharp`,
        ],
      })
    })

    it(`watching gatsby-source-filesystem and both having gatsby-source-filesystem and gatsby-source-wordpress, should install both`, async () => {
      checkDepsChanges.mockImplementationOnce(
        mockDepsChanges([`gatsby-source-filesystem`])
      )

      watch(process.cwd(), [`gatsby-source-filesystem`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [
          `gatsby`,
          `gatsby-source-wordpress`,
          `gatsby-source-filesystem`,
          `gatsby-plugin-sharp`,
        ],
      })

      const filePath = path.join(
        process.cwd(),
        `packages/gatsby-source-filesystem/package.json`
      )
      await callEventCallback(`add`, filePath)
      await callReadyCallback()

      assertPublish({
        include: [`gatsby-source-filesystem`, `gatsby-source-wordpress`],
        exclude: [`gatsby`, `gatsby-plugin-sharp`],
      })

      assertInstall({
        include: [`gatsby-source-filesystem`, `gatsby-source-wordpress`],
        exclude: [`gatsby`, `gatsby-plugin-sharp`],
      })
    })

    it(`handle case of package name not matching directory name`, async () => {
      checkDepsChanges.mockImplementationOnce(
        mockDepsChanges([`@gatsbyjs/parcel-namer-relative-to-cwd`])
      )

      watch(process.cwd(), [`gatsby`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [
          `gatsby`,
          `gatsby-source-wordpress`,
          `gatsby-source-filesystem`,
          `gatsby-plugin-sharp`,
        ],
      })

      const filePath = path.join(
        process.cwd(),
        `packages/gatsby-parcel-namer-relative-to-cwd/package.json`
      )
      await callEventCallback(`add`, filePath)
      await callReadyCallback()

      assertPublish({
        include: [
          `@gatsbyjs/parcel-namer-relative-to-cwd`,
          `gatsby`,
          `gatsby-parcel-config`,
        ],
        exclude: [`gatsby-plugin-sharp`],
      })

      assertInstall({
        include: [`gatsby`],
        exclude: [
          `@gatsbyjs/parcel-namer-relative-to-cwd`,
          `gatsby-plugin-sharp`,
        ],
      })
    })
  })

  describe(`order of operation`, () => {
    it(`publish and installs from verdaccio before copying files`, async () => {
      let lastOp = null
      let installWasCalledAfterFsCopy = false
      installPackages.mockImplementation(() => {
        if (lastOp === fs.copy) {
          installWasCalledAfterFsCopy = true
        }
        lastOp = installPackages
      })

      fs.copy.mockImplementation(() => {
        lastOp = fs.copy
      })

      checkDepsChanges.mockImplementationOnce(mockDepsChanges([`gatsby`]))

      watch(process.cwd(), [`gatsby`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [`gatsby`, `gatsby-plugin-sharp`],
      })

      const filePath = path.join(process.cwd(), `packages/gatsby/package.json`)
      await callEventCallback(
        `add`,
        path.join(process.cwd(), `packages/gatsby/not-package.json`)
      )
      await callEventCallback(`add`, filePath)

      await callReadyCallback()

      expect(installWasCalledAfterFsCopy).toBe(false)
      expect(installPackages).toBeCalled()
      expect(fs.copy).toBeCalled()
    })

    it(`installs from npm before copying files`, async () => {
      let lastOp = null
      let installWasCalledAfterFsCopy = false
      promisifiedSpawn.mockImplementation(() => {
        if (lastOp === fs.copy) {
          installWasCalledAfterFsCopy = true
        }
        lastOp = promisifiedSpawn
      })

      fs.copy.mockImplementation(() => {
        lastOp = fs.copy
      })

      checkDepsChanges.mockImplementationOnce(() =>
        Promise.resolve({
          didDepsChanged: false,
          packageNotInstalled: true,
        })
      )

      watch(process.cwd(), [`gatsby`], {
        scanOnce: true,
        quiet: true,
        monoRepoPackages,
        packageNameToPath,
        localPackages: [`gatsby`, `gatsby-plugin-sharp`],
      })

      const filePath = path.join(process.cwd(), `packages/gatsby/package.json`)
      await callEventCallback(
        `add`,
        path.join(process.cwd(), `packages/gatsby/not-package.json`)
      )
      await callEventCallback(`add`, filePath)

      await callReadyCallback()

      expect(installWasCalledAfterFsCopy).toBe(false)
      expect(promisifiedSpawn).toBeCalled()
      expect(fs.copy).toBeCalled()
    })
  })
})
