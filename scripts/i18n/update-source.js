const log4js = require(`log4js`)
const shell = require(`shelljs`)
const path = require(`path`)

require(`dotenv`).config()

const logger = log4js.getLogger(`update-source`)
logger.level = `info`

const protocol = `https://`
const host = `github.com`
const cacheDir = path.join(__dirname, `.cache`)
const owner = `gatsbyjs`
// Repo to be used as basis for translations
const sourceRepo = `gatsby-i18n-source`

const branch = `master`

const sourceRepoUrl = `${protocol}${process.env.GITHUB_API_TOKEN}@${host}/${owner}/${sourceRepo}.git`

const gatsbyMonorepoPath = path.join(__dirname, `..`, `..`)

const pathsToCopy = [
  `docs/docs`,
  `docs/tutorial`,
  `docs/contributing`,
  `docs/accessibility-statement.md`,
]

function cloneOrUpdateRepo(repoName, repoUrl) {
  logger.info(`Checking if local clone exists`)
  if (shell.ls(repoName).code !== 0) {
    logger.info(`No local clone. Cloning ${repoName}`)
    const { code } = shell.exec(
      `git clone --quiet --depth 1 ${repoUrl} --branch ${branch} > /dev/null`
    )
    // If cloning fails for whatever reason, we need to exit immediately
    // or we might accidentally push to the monorepo
    if (code !== 0) {
      logger.info(`Failed to clone repository. Exiting...`)
      process.exit(1)
    }
    shell.cd(repoName)
    shell.exec(`git checkout ${branch}`)
  } else {
    logger.info(`Clone exists. Updating`)
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
  // Get potential commit message early (before we "cd" into sourceRepo clone directory) to use last gatsbyjs/gatsby commit
  const commitMessage =
    shell.exec(
      `git log -1 --pretty="sync with monorepo gatsbyjs/gatsby@%H - %B"`
    ).stdout || `Update from gatsbyjs/gatsby`

  logger.info(`Checking if cache directory exists`)
  if (shell.cd(cacheDir).code !== 0) {
    logger.info(`No cache directory. Creating ${cacheDir}`)
    shell.mkdir(cacheDir)
    shell.cd(cacheDir)
  } else {
    logger.info(`Cache directory exists`)
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
  logger.info(`Checking if there are any changes to commit`)
  if (!shell.exec(`git status --porcelain`).stdout.length) {
    logger.info(`No changes to commit. Exiting...`)
    process.exit(0)
  }

  logger.info(`Committing changes`)
  shell.exec(`git add .`)

  // need to "escape" single quotes in commit message
  // http://blog.stvjam.es/2016/11/using-quotes-in-git-command-line-commit-messages/#Using-Single-Quotes
  if (
    shell.exec(
      `git commit -m '${commitMessage.replace(/'/g, `'\\''`)}' > /dev/null`
    ).code !== 0
  ) {
    logger.error(`Failed to commit to ${sourceRepo}`)
    process.exit(1)
  }
  logger.info(`Pushing changes to ${sourceRepo}`)
  // Push to source repo
  if (shell.exec(`git push origin ${branch} > /dev/null`).code !== 0) {
    logger.info(`Failed to push changes to ${sourceRepo}`)
    process.exit(1)
  } else {
    logger.info(`Pushed changes to ${sourceRepo}`)
  }
}

updateSourceRepo()
