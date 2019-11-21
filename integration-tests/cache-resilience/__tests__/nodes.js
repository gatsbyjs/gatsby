const fs = require(`fs`)
const { spawnSync } = require(`child_process`)
const path = require(`path`)
const v8 = require(`v8`)

jest.setTimeout(100000)

const gatsbyBin = path.join(
  `node_modules`,
  `gatsby`,
  `dist`,
  `bin`,
  `gatsby.js`
)

describe(`Cache`, () => {
  it(`is persisted between builds`, done => {
    spawnSync(gatsbyBin, [`clean`])

    // First run, get state
    spawnSync(gatsbyBin, [`build`], {
      stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
      },
    })

    const preBootstrapStateFromFirstRun = v8.deserialize(
      fs.readFileSync(`./on_pre_bootstrap`)
    )

    const postBuildStateFromFirstRun = v8.deserialize(
      fs.readFileSync(`./on_post_build`)
    )

    expect(preBootstrapStateFromFirstRun.size).toEqual(0)

    // Second run, get state and compare with state from previous run
    spawnSync(gatsbyBin, [`build`], {
      stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
      },
    })

    const preBootstrapStateFromSecondRun = v8.deserialize(
      fs.readFileSync(`./on_pre_bootstrap`)
    )

    expect(postBuildStateFromFirstRun).toEqual(preBootstrapStateFromSecondRun)

    done()
  })

  it(`is invalidated when a plugin is updated`, done => {
    spawnSync(gatsbyBin, [`clean`])

    // First run, get state
    spawnSync(gatsbyBin, [`build`], {
      stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
      },
    })

    const preBootstrapStateFromFirstRun = v8.deserialize(
      fs.readFileSync(`./on_pre_bootstrap`)
    )

    const postBuildStateFromFirstRun = v8.deserialize(
      fs.readFileSync(`./on_post_build`)
    )

    expect(preBootstrapStateFromFirstRun.size).toEqual(0)

    // Invalidate some plugin
    fs.appendFileSync(
      `./gatsby-node.js`,
      `// Placeholder comment for invalidation`
    )

    // Second run, get state and compare with state from previous run
    spawnSync(gatsbyBin, [`build`], {
      stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
      },
    })

    const preBootstrapStateFromSecondRun = v8.deserialize(
      fs.readFileSync(`./on_pre_bootstrap`)
    )

    // Remove node created by default site plugin
    postBuildStateFromFirstRun.delete(`TEST_NODE`)

    expect(postBuildStateFromFirstRun).toEqual(preBootstrapStateFromSecondRun)

    done()
  })
})
