const log4js = require(`log4js`)
const shell = require(`shelljs`)

let logger = log4js.getLogger(`sync`)

const host = `https://github.com`
const cacheDir = `.cache`
const owner = `gatsbyjs`
const repoBase = `gatsby`
// Repo to be used as basis for translations
const sourceRepo = `gatsby-i18n-source`

const sourceRepoUrl = `${host}/${owner}/${sourceRepo}.git`

const dirsToCopy = [
  `docs/docs`,
  `docs/tutorial`,
  `docs/contributing`,
  `docs/accessibility-statement.md`,
]

function cloneOrUpdateRepo(repoName, repoUrl) {
  if (shell.ls(repoName).code !== 0) {
    logger.debug(`cloning ${repoName}`)
    shell.exec(`git clone ${repoUrl}`)
  } else {
    // if the repo already exists, pull from it
    shell.cd(repoName)
    shell.exec(`git pull origin master`)
    shell.cd(`..`)
  }
}

// Copy over contents of origin repo (gatsby) to source repo (gatsby-source-i18n)
// FIXME make sure the main repo is updated before we do this
async function updateSourceRepo() {
  if (shell.cd(cacheDir).code !== 0) {
    logger.debug(`creating ${cacheDir}`)
    shell.mkdir(cacheDir)
    shell.cd(cacheDir)
  }
  cloneOrUpdateRepo(sourceRepo, sourceRepoUrl)
  // delete old content
  shell.rm(`-rf`, `${sourceRepo}/docs/*`)
  // repopulate content
  dirsToCopy.forEach(dir => {
    shell.cp(`-r`, `../../../${dir}`, `${sourceRepo}/docs`)
  })
  // push to source repo
  shell.exec(`git push origin master`)
}

async function syncTranslationRepo(code) {
  const transRepoName = `${repoBase}-${code}`
  const transRepoUrl = `${host}/${owner}/${transRepoName}`
  cloneOrUpdateRepo(transRepoName, transRepoUrl)
  shell.cd(transRepoName)

  // pull from the source
  shell.exec(`git remote add source ${sourceRepoUrl}`)
  const output = shell.exec(`git pull source master`).stdout
  if (output.includes("Already up to date.")) {
    logger.info(`We are already up to date with source.`)
    // teardownAndExit()
    return
  }
  const lines = output.split("\n")

  // Commit all merge conflicts
  const conflictLines = lines.filter(line => line.startsWith("CONFLICT"))
  const conflictFiles = conflictLines.map(line =>
    line.substr(line.lastIndexOf(" ") + 1)
  )

  // FIXME merge all conflicts

  // If no conflicts, merge directly into master
  if (conflictFiles.length === 0) {
    logger.info("No conflicts found. Committing directly to master.")
    shell.exec(`git checkout ${defaultBranch}`)
    shell.exec(`git merge ${syncBranch}`)
    shell.exec(`git push origin ${defaultBranch}`)
    return
  }

  // FIXME create a PR
}

updateSourceRepo()
