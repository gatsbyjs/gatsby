import createPluginDigest from "../create-plugin-digest"
import execa from "execa"
const os = require(`os`)
const path = require(`path`)
const uuid = require(`uuid`)
const fs = require(`fs-extra`)
const resolveFrom = require(`resolve-from`)

// TODO start with yarn but also add npm versions in parallel.
function createTmpDirectory() {
  const root = path.join(os.tmpdir(), uuid.v4())
  fs.mkdirSync(root)
  return root
}

async function yarnPackageInstall(packageName, root) {
  await execa(`yarn`, [`add`, packageName], { cwd: root })
}

async function npmPackageInstall(packageName, root) {
  await execa(`npm`, [`install`, packageName], { cwd: root })
}

describe(`create plugin dependecies digest`, () => {
  beforeAll(async () => {
    // Delete cache directory
    await fs.emptyDir(
      path.join(process.cwd(), `.cache`, `caches`, `plugin-digest`)
    )

    const fixtureSite = path.join(__dirname, `fixtures`, `simplesite`)

    await fs.writeFile(
      path.join(
        fixtureSite,
        `plugins`,
        `gatsby-plugin-cool-local`,
        `gatsby-node.js`
      ),
      `const secondary = require('@kylemathews/secondary-dep')\n//yo, me old`
    )

    await fs.writeFile(
      path.join(fixtureSite, `plugins`, `gatsby-plugin-cool-local`, `dep.js`),
      `// some old code`
    )
  })

  describe(`package plugin dependency digest`, () => {
    it(`returns the Gatsby version for internal plugins`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)
      const pageCreator = `gatsby-plugin-page-creator`

      const digest = await createPluginDigest(root, {
        name: pageCreator,
        resolve: resolveFrom(root, pageCreator),
      })

      const pkg = require(path.join(root, `node_modules/gatsby/package.json`))

      expect(digest.digest).toEqual(pkg.version)
    })

    // There's some special logic around gatsby-plugin-typescript depending
    // on whether it's a direct dependency of the project or a dependency of gatsby.
    it(`returns a digest for gatsby-plugin-typescript`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)
      const typescript = `gatsby-plugin-typescript`

      const typescriptDigest = await createPluginDigest(root, {
        name: typescript,
        resolve: resolveFrom(root, typescript),
      })
      expect(typescriptDigest).toMatchInlineSnapshot(`
        Object {
          "digest": "5d7f4b534e493ee70584574760fa7c91f77eda40",
          "isCached": false,
        }
      `)
    })

    it(`returns a digest for gatsby-source-drupal`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)
      const name = `gatsby-source-drupal`

      const digest = await createPluginDigest(root, {
        name,
        resolve: resolveFrom(root, name),
      })
      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "1ef6573345fc36e04a49cdf0506a1c26955d22a0",
          "isCached": false,
        }
      `)
    })

    it(`repeated calls to the same plugin returns a cached version`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)
      const name = `gatsby-source-drupal`

      const digest = await createPluginDigest(root, {
        name,
        resolve: resolveFrom(root, name),
      })
      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "1ef6573345fc36e04a49cdf0506a1c26955d22a0",
          "isCached": true,
        }
      `)
    })

    let oldDigest = ``
    it(`returns a digest for local plugins generated from the source and dependencies`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)

      const name = `gatsby-plugin-cool-local`
      const digest = await createPluginDigest(root, {
        name,
        resolve: path.join(root, `plugins`, name),
      })
      oldDigest = digest.digest
      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "e725ff4236880cf5c13d827bb09e460550e49ec1",
          "isCached": false,
        }
      `)
    })
    it(`returns a new digest for a local plugin when the source changes`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)

      const name = `gatsby-plugin-cool-local`

      await fs.writeFile(
        path.join(root, `plugins`, name, `gatsby-node.js`),
        `const secondary = require('@kylemathews/secondary-dep')\n//yo, me new`
      )

      const digest = await createPluginDigest(root, {
        name,
        resolve: path.join(root, `plugins`, name),
      })

      expect(oldDigest !== digest.digest).toBeTruthy()
      oldDigest = digest.digest
      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "820a198912c1d9ac3b95dd3d4277f1f3ded00f06",
          "isCached": false,
        }
      `)
    })
    it(`touching a file (updating its mtime) doesn't change the digest`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)

      const name = `gatsby-plugin-cool-local`

      // Touch
      const time = new Date()
      fs.utimesSync(
        path.join(root, `plugins`, name, `gatsby-node.js`),
        time,
        time
      )

      const digest = await createPluginDigest(root, {
        name,
        resolve: path.join(root, `plugins`, name),
      })

      expect(oldDigest === digest.digest).toBeTruthy()
      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "820a198912c1d9ac3b95dd3d4277f1f3ded00f06",
          "isCached": false,
        }
      `)
    })
    it(`returns a new digest when a local dependency is added`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)

      const name = `gatsby-plugin-cool-local`

      await fs.writeFile(
        path.join(root, `plugins`, name, `gatsby-node.js`),
        `const secondary = require('@kylemathews/secondary-dep')\nrequire('./dep')//yo, me new`
      )

      const digest = await createPluginDigest(root, {
        name,
        resolve: path.join(root, `plugins`, name),
      })

      expect(oldDigest !== digest.digest).toBeTruthy()
      oldDigest = digest.digest
      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "ab74e3b7c7f97e2b83575bd096314b1b9d533fed",
          "isCached": false,
        }
      `)
    })
    it(`returns a new digest when a local dependency is changed`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)

      const name = `gatsby-plugin-cool-local`

      await fs.writeFile(
        path.join(root, `plugins`, name, `dep.js`),
        `// some new code`
      )

      const digest = await createPluginDigest(root, {
        name,
        resolve: path.join(root, `plugins`, name),
      })

      expect(oldDigest !== digest.digest).toBeTruthy()
      oldDigest = digest.digest
      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "8ea702af88f2ffc4b40e6d06221ccec15d2d5037",
          "isCached": false,
        }
      `)
    })
    it(`returns a cached version if repeatedly called`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)

      const name = `gatsby-plugin-cool-local`

      const digest = await createPluginDigest(root, {
        name,
        resolve: path.join(root, `plugins`, name),
      })

      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "8ea702af88f2ffc4b40e6d06221ccec15d2d5037",
          "isCached": true,
        }
      `)
    })

    // If there's no gatsby-node.js, the plugin can't cache anything
    // so a digest isn't meaningful.
    it(`returns the directory name if there's no gatsby-node.js`, async () => {
      const root = path.join(__dirname, `fixtures`, `simplesite`)

      const name = `gatsby-plugin-no-gatsby-node.js`

      const digest = await createPluginDigest(root, {
        name,
        resolve: path.join(root, `plugins`, name),
      })

      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "plugins/gatsby-plugin-no-gatsby-node.js/gatsby-node.js",
          "isCached": false,
        }
      `)
    })
  })

  describe(`package plugin dependency digest w/o a lockfile`, () => {
    it(`returns the Gatsby version for internal plugins`, async () => {
      const root = path.join(__dirname, `fixtures`, `no-lockfile`)
      const pageCreator = `gatsby-plugin-page-creator`

      const digest = await createPluginDigest(root, {
        name: pageCreator,
        resolve: resolveFrom(root, pageCreator),
      })

      const pkg = require(path.join(root, `node_modules/gatsby/package.json`))

      expect(digest.digest).toEqual(pkg.version)
    })

    // There's some special logic around gatsby-plugin-typescript depending
    // on whether it's a direct dependency of the project or a dependency of gatsby.
    it(`returns a digest for gatsby-plugin-typescript`, async () => {
      const root = path.join(__dirname, `fixtures`, `no-lockfile`)
      const typescript = `gatsby-plugin-typescript`

      const typescriptDigest = await createPluginDigest(root, {
        name: typescript,
        resolve: resolveFrom(root, typescript),
      })
      expect(typescriptDigest).toMatchInlineSnapshot(`
        Object {
          "digest": "NO_SITE_DIGEST",
          "isCached": false,
        }
      `)
    })

    it(`returns a digest for gatsby-source-drupal`, async () => {
      const root = path.join(__dirname, `fixtures`, `no-lockfile`)
      const name = `gatsby-source-drupal`

      const digest = await createPluginDigest(root, {
        name,
        resolve: resolveFrom(root, name),
      })
      expect(digest).toMatchInlineSnapshot(`
        Object {
          "digest": "NO_SITE_DIGEST",
          "isCached": false,
        }
      `)
    })
  })
})
