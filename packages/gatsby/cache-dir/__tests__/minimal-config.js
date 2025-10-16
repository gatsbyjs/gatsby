const path = require(`path`)
const child = require(`child_process`)

it(`Builds cache-dir with minimal config`, done => {
  const args = [
    require.resolve(`@babel/cli/bin/babel.js`),
    path.join(__dirname, `..`),
    `--config-file`,
    path.join(__dirname, `.babelrc`),
    `--ignore`,
    `**/__tests__`,
  ]

  const spawn = child.spawn(process.execPath, args)

  let stderr = ``
  let stdout = ``

  spawn.stderr.on(`data`, function (chunk) {
    stderr += chunk
  })

  spawn.stdout.on(`data`, function (chunk) {
    stdout += chunk
  })

  spawn.on(`close`, function () {
    try {
      // This is a little weird but this node.js deprecation warning is printed on node 22+ BUT we
      // fully suppress all node.js warnings in CI for some reason. This pattern allows either
      // nothing or just this warning to be printed to stderr, allowing it to pass locally and in CI.
      expect(stderr).toMatch(
        /^(|\(node:\d+\) \[DEP0180\] DeprecationWarning: fs\.Stats constructor is deprecated\.\s+\(Use `node --trace-deprecation \.\.\.` to show where the warning was created\)[\s\n]*)$/s
      )
      expect(stdout).not.toEqual(``)
    } catch (err) {
      done(err)
      return
    }
    done()
  })
}, 30000)
