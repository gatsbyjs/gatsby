const log4js = require(`log4js`)
const shell = require(`shelljs`)

let logger = log4js.getLogger(`update-source`)

const host = `https://github.com`
const cacheDir = `.cache`
const owner = `gatsbyjs`
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
  shell.cd(sourceRepo)
  // delete old content
  shell.rm(`-rf`, `docs/*`)
  // repopulate content
  dirsToCopy.forEach(dir => {
    shell.cp(`-r`, `../../../../${dir}`, `docs`)
  })
  shell.exec(`git add *`)
  shell.exec(`git commit -m 'Update gatsby monorepo'`)
  // push to source repo
  shell.exec(`git push origin master`)
}

updateSourceRepo()
