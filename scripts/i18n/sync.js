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
    shell.exec(`git pull`)
    shell.cd(`..`)
  }
}

// Copy over contents of origin repo (gatsby) to source repo (gatsby-source-i18n)
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
  const transRepoName = `${host}/${owner}/${repoBase}-${code}`
}

updateSourceRepo()
