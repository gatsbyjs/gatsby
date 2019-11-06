const log4js = require(`log4js`)
const shell = require(`shelljs`)
const path = require(`path`)

require(`dotenv`).config()

let logger = log4js.getLogger(`update-source`)
logger.level = `info`

const protocol = `https://`
const host = `github.com`
const cacheDir = path.join(__dirname, `.cache`)
const owner = `gatsbyjs`
// Repo to be used as basis for translations
const sourceRepo = `gatsby-i18n-source`

// const branch = `master`
const branch = `test-update` // test branch

const sourceRepoUrl = `${protocol}${process.env.GITHUB_API_TOKEN}@${host}/${owner}/${sourceRepo}.git`

const gatsbyMonorepoPath = path.join(__dirname, `..`, `..`)

const pathsToCopy = [
  `docs/docs`,
  `docs/tutorial`,
  `docs/contributing`,
  `docs/accessibility-statement.md`,
]

function cloneOrUpdateRepo(repoName, repoUrl) {
  if (shell.ls(repoName).code !== 0) {
    logger.debug(`Cloning ${repoName}`)
    const { code } = shell.exec(
      `git clone --quiet --depth 1 ${repoUrl} --branch ${branch} > /dev/null`
    )
    // If cloning fails for whatever reason, we need to exit immediately
    // or we might accidentally push to the monorepo
    if (code !== 0) {
      process.exit(1)
    }
    shell.cd(repoName)
    shell.exec(`git checkout ${branch}`)
  } else {
    // if the repo already exists, pull from it
    shell.cd(repoName)
    shell.exec(`git fetch`)
    shell.exec(`git checkout ${branch}`)
    shell.exec(`git pull origin ${branch}`)
  }
}

// Copy over contents of origin repo (gatsby) to the source repo (gatsby-source-i18n)
// TODO make sure the main repo is updated before we do this
async function updateSourceRepo() {
  if (shell.cd(cacheDir).code !== 0) {
    logger.debug(`Creating ${cacheDir}`)
    shell.mkdir(cacheDir)
    shell.cd(cacheDir)
  }
  cloneOrUpdateRepo(sourceRepo, sourceRepoUrl)
  // Delete old content
  logger.info(`Repopulating content`)
  shell.rm(`-rf`, `docs/*`)
  // Repopulate content from the monorepo
  pathsToCopy.forEach(p => {
    shell.cp(`-r`, path.join(gatsbyMonorepoPath, p), `docs`)
  })

  // exit if there are no changes to commit
  if (!shell.exec(`git status --porcelain`).stdout.length) {
    logger.info(`No changes to commit. Exiting...`)
    process.exit(0)
  }

  shell.exec(`git add .`)
  // TODO use the latest hash & commit message as the message here
  if (
    shell.exec(`git commit -m 'Update from gatsbyjs/gatsby' > /dev/null`)
      .code !== 0
  ) {
    logger.error(`Failed to commit to ${sourceRepo}`)
    process.exit(1)
  }
  // Push to source repo
  shell.exec(`git push origin ${branch}`)
}

updateSourceRepo()
