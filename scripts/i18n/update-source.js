const log4js = require(`log4js`)
const shell = require(`shelljs`)
const path = require(`path`)

let logger = log4js.getLogger(`update-source`)

const protocol = `https://`
const host = `github.com`
const cacheDir = `.cache`
const owner = `gatsbyjs`
// Repo to be used as basis for translations
const sourceRepo = `gatsby-i18n-source`

const sourceRepoUrl = `${protocol}${process.env.GITHUB_API_TOKEN}@${host}/${owner}/${sourceRepo}.git`

const originRepo = process.env.PWD

const dirsToCopy = [
  `docs/docs`,
  `docs/tutorial`,
  `docs/contributing`,
  `docs/accessibility-statement.md`,
]

function cloneOrUpdateRepo(repoName, repoUrl) {
  shell.cd(path.join(originRepo, `..`))
  if (shell.ls(repoName).code !== 0) {
    logger.debug(`Cloning ${repoName}`)
    shell.exec(`git clone --quiet --depth 1 ${repoUrl} > /dev/null`)
  } else {
    // if the repo already exists, pull from it
    shell.cd(repoName)
    shell.exec(`git pull origin master`)
  }
}

// Copy over contents of origin repo (gatsby) to the source repo (gatsby-source-i18n)
async function updateSourceRepo() {
  if (shell.cd(cacheDir).code !== 0) {
    logger.debug(`Creating ${cacheDir}`)
    shell.mkdir(cacheDir)
    shell.cd(cacheDir)
  }
  cloneOrUpdateRepo(sourceRepo, sourceRepoUrl)
  shell.cd(sourceRepo)
  // Delete old content
  shell.rm(`-rf`, `docs/*`)
  // Repopulate content
  dirsToCopy.forEach(dir => {
    shell.cp(`-r`, path.join(originRepo, dir), `docs`)
  })

  // Check if there are any changes to commit
  if (shell.exec(`git status --porcelain`).stdout.length) {
    shell.exec(`git add .`)
    if (shell.exec(`git commit -m 'Update from gatsbyjs/gatsby'`).code !== 0) {
      logger.debug(`Git commit failed`)
      shell.exit(1)
    }
  }
  // Push to source repo
  shell.exec(`git push origin master`)
}

updateSourceRepo()
