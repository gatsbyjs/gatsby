import createPluginDigest from "../create-plugin-digest"
import execa from "execa"
const os = require(`os`)
const path = require(`path`)
const uuid = require(`uuid`)
const fs = require(`fs-extra`)

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

describe(`createPluginDigest`, () => {
  describe(`packages`, () => {
    let yarnRoot
    let npmRoot
    let packageName
    beforeAll(async () => {
      // Install a package in a temp dir
      yarnRoot = createTmpDirectory()
      npmRoot = createTmpDirectory()
      packageName = `@kylemathews/primary-dep`
      await yarnPackageInstall(`${packageName}@1.0.0`, yarnRoot)
      await yarnPackageInstall(`@kylemathews/secondary-dep@1.0.0`, yarnRoot)
      await npmPackageInstall(`${packageName}@1.0.0`, npmRoot)
      await npmPackageInstall(`@kylemathews/secondary-dep@1.0.0`, npmRoot)
      await fs.emptyDir(
        path.join(process.cwd(), `.cache`, `caches`, `plugin-digest`)
      )
    })
    describe(`yarn`, () => {
      it(`creates a digest for a package`, async () => {
        const digest = await createPluginDigest(yarnRoot, packageName)
        expect(digest).toMatchSnapshot()
        expect(digest.isCached).toEqual(false)
      })

      it(`creates digests for multiple packages`, async () => {
        const digest = await createPluginDigest(yarnRoot, packageName)
        const digest2 = await createPluginDigest(
          yarnRoot,
          `@kylemathews/secondary-dep`
        )
        expect(digest).toMatchSnapshot()
        expect(digest2).toMatchSnapshot()
        expect(digest.isCached).toEqual(true)
        expect(digest2.isCached).toEqual(false)
      })

      it(`returns a cached response if the lock file hasn't changed`, async () => {
        // Calling it again with no changes returns a cached response.
        const cachedDigest = await createPluginDigest(yarnRoot, packageName)
        expect(cachedDigest.isCached).toEqual(true)
      })

      it(`returns a different digest when the package version changes`, async () => {
        const digest = await createPluginDigest(yarnRoot, packageName)

        // Update the version of the package
        await yarnPackageInstall(`${packageName}@1.0.1`, yarnRoot)

        // Get digest again
        const newDigest = await createPluginDigest(yarnRoot, packageName)
        expect(newDigest).toMatchSnapshot()
        expect(newDigest.digest !== digest.digest).toBeTruthy()
      })

      it(`It returns the correct tree when transitive dependencies get updated`, async () => {
        const digest = await createPluginDigest(yarnRoot, packageName)
        expect(digest).toMatchSnapshot()

        // Install a newer version of our tertiary dependency.
        await yarnPackageInstall(`@kylemathews/tertiary-dep@1.0.1`, yarnRoot)

        const newDigest = await createPluginDigest(yarnRoot, packageName)
        expect(newDigest).toMatchSnapshot()
        expect(digest.isCached).toEqual(true)
        expect(newDigest.isCached).toEqual(false)
        expect(newDigest !== digest).toBeTruthy()
      })
    })
    describe(`npm`, () => {
      it(`creates a digest for a package`, async () => {
        const digest = await createPluginDigest(npmRoot, packageName)
        expect(digest).toMatchSnapshot()
        expect(digest.isCached).toEqual(false)
      })

      it(`creates digests for multiple packages`, async () => {
        const digest = await createPluginDigest(npmRoot, packageName)
        const digest2 = await createPluginDigest(
          npmRoot,
          `@kylemathews/secondary-dep`
        )
        expect(digest).toMatchSnapshot()
        expect(digest2).toMatchSnapshot()
        expect(digest.isCached).toEqual(true)
        expect(digest2.isCached).toEqual(false)
      })

      it(`returns a cached response if the lock file hasn't changed`, async () => {
        // Calling it again with no changes returns a cached response.
        const cachedDigest = await createPluginDigest(npmRoot, packageName)
        expect(cachedDigest.isCached).toEqual(true)
      })

      it(`returns a different digest when the package version changes`, async () => {
        const digest = await createPluginDigest(npmRoot, packageName)

        // Update the version of the package
        await yarnPackageInstall(`${packageName}@1.0.1`, npmRoot)

        // Get digest again
        const newDigest = await createPluginDigest(npmRoot, packageName)
        expect(newDigest).toMatchSnapshot()
        expect(newDigest.digest !== digest.digest).toBeTruthy()
      })

      it(`It returns the correct tree when transitive dependencies get updated`, async () => {
        const digest = await createPluginDigest(npmRoot, packageName)
        expect(digest).toMatchSnapshot()

        // Install a newer version of our tertiary dependency.
        await yarnPackageInstall(`@kylemathews/tertiary-dep@1.0.1`, npmRoot)

        const newDigest = await createPluginDigest(npmRoot, packageName)
        expect(newDigest).toMatchSnapshot()
        expect(digest.isCached).toEqual(true)
        expect(newDigest.isCached).toEqual(false)
        expect(newDigest !== digest).toBeTruthy()
      })
    })
  })

  describe(`local plugins`, () => {
    let yarnRoot
    let npmRoot
    let packageName
    beforeAll(async () => {
      // Install a package in a temp dir
      yarnRoot = createTmpDirectory()
      npmRoot = createTmpDirectory()
      packageName = `@kylemathews/primary-dep`
      await yarnPackageInstall(`${packageName}@1.0.0`, yarnRoot)
      await yarnPackageInstall(`@kylemathews/secondary-dep@1.0.0`, yarnRoot)
      await npmPackageInstall(`${packageName}@1.0.0`, npmRoot)
      await npmPackageInstall(`@kylemathews/secondary-dep@1.0.0`, npmRoot)
      await fs.emptyDir(
        path.join(process.cwd(), `.cache`, `caches`, `plugin-digest`)
      )
    })
    it(`creates a digest for a local file by tracing its dependencies`, async () => {
      // Add a file which requires a file which requires the package.
      const pathToFile = path.join(yarnRoot, `./a-file.js`)
      const pathToFile2 = path.join(yarnRoot, `./a-file2.js`)
      await fs.writeFile(pathToFile, `import "@kylemathews/primary-dep"`)
      await fs.writeFile(pathToFile2, `import "./a-file"`)
      const digest = await createPluginDigest(yarnRoot, `./a-file2.js`)
      expect(digest).toMatchSnapshot()
    })

    it(`returns a cached response if the lock file and src files haven't changed`, async () => {
      // Calling it again with no changes returns a cached response.
      const digest = await createPluginDigest(yarnRoot, `./a-file2.js`)
      expect(digest.isCached).toEqual(true)
    })

    it(`returns a different digest when the src files change`, async () => {
      const digest = await createPluginDigest(yarnRoot, `./a-file2.js`)
      // Change one of the files
      const pathToFile = path.join(yarnRoot, `./a-file.js`)
      await fs.writeFile(
        pathToFile,
        `import "@kylemathews/primary-dep"\nconst a = 3`
      )
      const newDigest = await createPluginDigest(yarnRoot, `./a-file2.js`)
      expect(newDigest).toMatchSnapshot()
      expect(newDigest !== digest).toEqual(true)
      expect(digest.isCached).toEqual(true)
      expect(newDigest.isCached).toEqual(false)
    })
  })
})
