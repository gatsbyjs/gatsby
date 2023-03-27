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
    stderr = stderr
      .replace(`Browserslist: caniuse-lite is outdated. Please run:`, ``)
      .replace(`npx update-browserslist-db@latest`, ``)
      .replace(
        `Why you should do it regularly: https://github.com/browserslist/update-db#readme`,
        ``
      )
      .trim()

    expect(stderr).toEqual(``)
    expect(stdout).not.toEqual(``)
    done()
  })
}, 30000)
