import { testRequireError } from "../test-require-error"

describe(`test-require-error`, () => {
  it(`detects require errors`, () => {
    try {
      require(`./fixtures/module-does-not-exist`)
    } catch (err) {
      expect(testRequireError(`./fixtures/module-does-not-exist`, err)).toEqual(
        true
      )
    }
  })
  it(`detects require errors when using windows path`, () => {
    try {
      require(`.\\fixtures\\module-does-not-exist`)
    } catch (err) {
      expect(
        testRequireError(`.\\fixtures\\module-does-not-exist`, err)
      ).toEqual(true)
    }
  })
  it(`Only returns true on not found errors for actual module not "not found" errors of requires inside the module`, () => {
    try {
      require(`./fixtures/bad-module-require`)
    } catch (err) {
      expect(testRequireError(`./fixtures/bad-module-require`, err)).toEqual(
        false
      )
    }
  })
  it(`ignores other errors`, () => {
    try {
      require(`./fixtures/bad-module-syntax`)
    } catch (err) {
      expect(testRequireError(`./fixtures/bad-module-syntax`, err)).toEqual(
        false
      )
    }
  })

  describe(`handles error message thrown by Bazel`, () => {
    it(`detects require errors`, () => {
      const bazelModuleNotFoundError = new Error(`Error: //:build_bin cannot find module './fixtures/module-does-not-exist' required by '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules/gatsby/dist/bootstrap/get-config-file.js'
      looked in:
        built-in, relative, absolute, nested node_modules - Error: Cannot find module './fixtures/module-does-not-exist'
        runfiles - Error: Cannot find module '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/fixtures/module-does-not-exist'
        node_modules attribute (com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules) - Error: Cannot find module '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules/fixtures/module-does-not-exist'`)

      expect(
        testRequireError(
          `./fixtures/module-does-not-exist`,
          bazelModuleNotFoundError
        )
      ).toEqual(true)
    })

    it(`detects require errors`, () => {
      const bazelModuleNotFoundError = new Error(`Error: //:build_bin cannot find module 'cheese' required by '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules/gatsby/dist/bootstrap/fixtures/bad-module-require.js'
      looked in:
        built-in, relative, absolute, nested node_modules - Error: Cannot find module 'cheese'
        runfiles - Error: Cannot find module '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/cheese'
        node_modules attribute (com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules) - Error: Cannot find module '/private/var/tmp/_bazel_misiek/eba1803983a26276494495d851e478a5/execroot/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/bazel-out/darwin-fastbuild/bin/build.runfiles/com_github_bweston92_debug_gatsby_bazel_rules_nodejs/node_modules/cheese'`)

      expect(
        testRequireError(
          `./fixtures/bad-module-require`,
          bazelModuleNotFoundError
        )
      ).toEqual(false)
    })
  })
})
