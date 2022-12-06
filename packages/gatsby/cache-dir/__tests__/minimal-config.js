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
    // warning we want to filter out:
    // Browserslist: caniuse-lite is outdated. Please run:
    //   npx browserslist@latest --update-db
    //   Why you should do it regularly: https://github.com/browserslist/browserslist#browsers-data-updating
    stderr = stderr
      .replace(`Browserslist: caniuse-lite is outdated. Please run:`, ``)
      .replace(`npx browserslist@latest --update-db`, ``)
      .replace(
        `Why you should do it regularly: https://github.com/browserslist/browserslist#browsers-data-updating`,
        ``
      )
      .trim()

    expect(stderr).toEqual(``)
    expect(stdout).not.toEqual(``)
    done()
  })
}, 30000)
