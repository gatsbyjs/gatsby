const execa = require(`execa`)
const { resolve } = require(`path`)

const {
  clearTestOutput,
  getTestInputs,
  readTestOutput,
} = require(`../test-utils`)

const projectPath = resolve(`${__dirname}/..`)
const rootRepoPath = resolve(`${__dirname}/../../..`)

describe(`Query running`, () => {
  const dbEngines = [`redux`, `loki`]

  clearTestOutput()
  const testInputs = getTestInputs()

  // install dependencies of the project
  execa.shellSync(`npm install`, {
    cwd: projectPath,
    stdio: `inherit`,
  })

  // install gatsby-dev
  execa.shellSync(`sudo npm install -g gatsby-dev-cli`, {
    stdio: `inherit`,
  })

  // setup gatsby-dev-cli
  execa.shellSync(`gatsby-dev --set-path-to-repo "${rootRepoPath}"`, {
    stdio: `inherit`,
  })

  // use gatsby-dev-cli
  execa.shellSync(`gatsby-dev --scan-once --copy-all --quiet`, {
    cwd: projectPath,
    stdio: `inherit`,
  })

  // chmod +x
  execa.shellSync(`chmod +x ./node_modules/.bin/gatsby`, {
    cwd: projectPath,
    stdio: `inherit`,
  })

  // do both builds first
  dbEngines.forEach(dbEngine => {
    execa.shellSync(`npm run clean-and-build`, {
      cwd: projectPath,
      env: { GATSBY_DB_NODES: dbEngine },
      stdio: `inherit`,
    })
  })

  testInputs.forEach(testInput => {
    describe(testInput.name, () => {
      const [reduxResults, lokiResults] = dbEngines.map(dbEngine =>
        readTestOutput(testInput, dbEngine)
      )

      it(`Using redux matches snapshot`, () => {
        expect(reduxResults).toMatchSnapshot()
      })
      it(`Using loki matches redux`, () => {
        expect(lokiResults).toEqual(reduxResults)
      })
    })
  })
})
