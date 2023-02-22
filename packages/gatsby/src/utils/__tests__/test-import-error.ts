import path from "path"
import { testImportError } from "../test-import-error"

describe(`test-import-error`, () => {
  it(`detects import errors`, async () => {
    try {
      // @ts-expect-error Module doesn't really exist
      await import(`./fixtures/module-does-not-exist.js`)
    } catch (err) {
      expect(
        testImportError(`./fixtures/module-does-not-exist.js`, err)
      ).toEqual(true)
    }
  })

  it(`detects import errors when using windows path`, async () => {
    try {
      // @ts-expect-error Module doesn't really exist
      await import(`.\\fixtures\\module-does-not-exist.js`)
    } catch (err) {
      expect(
        testImportError(`.\\fixtures\\module-does-not-exist.js`, err)
      ).toEqual(true)
    }
  })

  it(`handles windows paths with double slashes`, async () => {
    expect(
      testImportError(
        `C:\\fixtures\\nothing.js`,
        `Error: Cannot find module 'C:\\\\fixtures\\\\nothing.js'`
      )
    ).toEqual(true)
  })

  it(`Only returns true on not found errors for actual module not "not found" errors of imports inside the module`, async () => {
    try {
      await import(path.resolve(`./fixtures/bad-module-import.js`))
    } catch (err) {
      expect(testImportError(`./fixtures/bad-module-import.js`, err)).toEqual(
        false
      )
    }
  })

  it(`ignores other errors`, async () => {
    try {
      await import(path.resolve(`./fixtures/bad-module-syntax.js`))
    } catch (err) {
      expect(testImportError(`./fixtures/bad-module-syntax.js`, err)).toEqual(
        false
      )
    }
  })

  describe(`handles error message thrown by Bazel`, () => {
    it(`detects import errors`, () => {
      const bazelModuleNotFoundError =
        new Error(`Error: //:build_bin cannot find module './fixtures/module-does-not-exist.js' required by '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules/gatsby/dist/bootstrap/get-config-file.js'
      looked in:
        built-in, relative, absolute, nested node_modules - Error: Cannot find module './fixtures/module-does-not-exist.js'
        runfiles - Error: Cannot find module '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/fixtures/module-does-not-exist.js'
        node_modules attribute (com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules) - Error: Cannot find module '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules/fixtures/module-does-not-exist.js'`)

      expect(
        testImportError(
          `./fixtures/module-does-not-exist.js`,
          bazelModuleNotFoundError
        )
      ).toEqual(true)
    })

    it(`detects import errors`, () => {
      const bazelModuleNotFoundError =
        new Error(`Error: //:build_bin cannot find module 'cheese' required by '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules/gatsby/dist/bootstrap/fixtures/bad-module-import.js'
      looked in:
        built-in, relative, absolute, nested node_modules - Error: Cannot find module 'cheese'
        runfiles - Error: Cannot find module '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/cheese'
        node_modules attribute (com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules) - Error: Cannot find module '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules/cheese'`)

      expect(
        testImportError(
          `./fixtures/bad-module-import.js`,
          bazelModuleNotFoundError
        )
      ).toEqual(false)
    })
  })
})
