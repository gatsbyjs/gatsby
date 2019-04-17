// const path = require(`path`)
// const child = require(`child_process`)

it(`Builds cache-dir with minimal config`, done => {
  done()
  const used = process.memoryUsage()
  for (let key in used) {
    console.log(
      `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
    )
  }
  // const args = [
  //   require.resolve(`@babel/cli/bin/babel.js`),
  //   path.join(__dirname, `..`),
  //   `--config-file`,
  //   path.join(__dirname, `.babelrc`),
  //   `--ignore`,
  //   `**/__tests__`,
  // ]

  // const spawn = child.spawn(process.execPath, args)

  // let stderr = ``
  // let stdout = ``

  // spawn.stderr.on(`data`, function(chunk) {
  //   stderr += chunk
  // })

  // spawn.stdout.on(`data`, function(chunk) {
  //   stdout += chunk
  // })

  // spawn.on(`close`, function() {
  //   expect(stderr).toEqual(``)
  //   expect(stdout).not.toEqual(``)
  //   done()
  // })
}, 30000)
