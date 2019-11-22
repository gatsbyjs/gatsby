const fs = require(`fs`)
const { spawnSync } = require(`child_process`)
const path = require(`path`)
const v8 = require(`v8`)
const _ = require(`lodash`)

jest.setTimeout(100000)

const gatsbyBin = path.join(
  `node_modules`,
  `gatsby`,
  `dist`,
  `bin`,
  `gatsby.js`
)

const compareState = (oldState, newState) => {
  const additions = _.differenceWith(
    Array.from(newState.values()),
    Array.from(oldState.values()),
    _.isEqual
  )
  const deletions = _.differenceWith(
    Array.from(oldState.values()),
    Array.from(newState.values()),
    _.isEqual
  )
  const changes = _.intersectionWith(additions, deletions, _.isEqual)
  return {
    additions,
    deletions,
    changes,
  }
}

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

    const postBootstrapStateFromFirstRun = v8.deserialize(
      fs.readFileSync(`./on_post_bootstrap`)
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

    expect(postBootstrapStateFromFirstRun).toEqual(
      preBootstrapStateFromSecondRun
    )

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

    const postBootstrapStateFromFirstRun = v8.deserialize(
      fs.readFileSync(`./on_post_bootstrap`)
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

    expect(postBootstrapStateFromFirstRun).toMatchSnapshot()

    expect(preBootstrapStateFromSecondRun).toMatchSnapshot()

    // Remove node created by default site plugin
    // postBootstrapStateFromFirstRun.delete(`TEST_NODE`)

    expect(
      compareState(
        postBootstrapStateFromFirstRun,
        preBootstrapStateFromSecondRun
      )
    ).toMatchSnapshot({
      buildTime: expect.any(String),
      internal: { contentDigest: expect.any(String) },
    })

    done()
  })
})
