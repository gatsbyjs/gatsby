const fs = require(`fs`)
const yaml = require(`js-yaml`)
const shell = require(`shelljs`)
const { graphql } = require(`@octokit/graphql`)
const log4js = require(`log4js`)

require(`dotenv`).config()

const { makeProgressIssue } = require(`./make-progress-issue`)
const { inviteMaintainers } = require(`./invite-maintainers`)

const host = `https://github.com`
const cacheDir = `.cache`
const branch = `master`

// config for testing
// const owner = "tesseralis-fan-club"
// const sourceRepoName = "tesseralis.club"
// const issueRepo = "tesseralis.club"

const owner = `gatsbyjs`
const sourceRepoName = `gatsby-i18n-source`
const issueRepo = `gatsby` // repo where the request issues are

const sourceUrl = `${host}/${owner}/${sourceRepoName}.git`

// base name for the new repository
const projectName = `gatsby`

// fill in with the lang code
let logger = log4js.getLogger(`create`)

const codeownersFile = `CODEOWNERS`

const issueBody = makeProgressIssue()

async function getIssue(issueNo) {
  const { repository } = await graphql(
    `
      query($issueRepo: String!, $owner: String!, $issueNo: Int!) {
        repository(name: $issueRepo, owner: $owner) {
          issue(number: $issueNo) {
            id
            body
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_ADMIN_AUTH_TOKEN}`,
      },
      issueRepo,
      owner,
      issueNo,
    }
  )
  return repository.issue
}

function getYamlArgs(text) {
  const yamlStr = text.match(/(?<=```yaml)[^`]*(?=```)/gm)[0]
  return yaml.safeLoad(yamlStr)
}

// Create the new repo on github
function setupSourceRepo() {
  logger.info(`setting up source repo`)
  // download source repository if needed
  if (shell.cd(cacheDir).code !== 0) {
    logger.debug(`creating ${cacheDir}`)
    shell.mkdir(cacheDir)
    shell.cd(cacheDir)
  }
  if (shell.ls(sourceRepoName).code !== 0) {
    logger.debug(`cloning source repo`)
    shell.exec(`git clone ${sourceUrl}`)
  } else {
    // if the repo already exists, pull from it
    shell.cd(sourceRepoName)
    shell.exec(`git pull`)
    shell.cd(`..`)
  }
}

function pushSourceContent(transRepo, langName, codeowners) {
  // Delete old version of cache if it exists
  if (shell.ls(transRepo.name).code === 0) {
    logger.debug(`folder name ${transRepo.name} exists already. Deleting...`)
    shell.rm(`-rf`, transRepo.name)
  }

  // copy source repository and add new repo as origin
  shell.cp(`-R`, sourceRepoName, transRepo.name)
  shell.cd(transRepo.name)

  // create the codeowners file
  logger.info(`writing ${codeownersFile}`)
  const codeownersFileContent = `*   ${codeowners.map(m => `@` + m).join(` `)}`
  shell.exec(`echo "${codeownersFileContent}" > ${codeownersFile}`)
  shell.exec(`git add ${codeownersFile}`)

  // create the new README
  const readmeTemplate = `
# Gatsby ${langName} Translation

This repo contains the ${langName} translation for Gatsby.

Please refer to the [Translation Progress Issue](${transRepo.url}/issues/1) to start translating!

Useful Links:

* [Style Guide](/style-guide.md)
* [Gatsby Translation Guide](https://www.gatsbyjs.org/contributing/gatsby-docs-translation-guide/)
* [Gatsby Discord](https://gatsby.dev/discord)

(Feel free to translate this document and add any content you feel would be useful to contributors).
  `
  fs.writeFileSync(`README.md`, readmeTemplate)
  shell.exec(`git add README.md`)

  shell.exec(`git commit -am 'add CODEOWNERS and README'`)

  // push new content
  logger.info(`pushing source content`)
  shell.exec(`git remote set-url origin ${transRepo.url}.git`)
  shell.exec(`git push origin ${branch}`)
}

/* Create repository on GitHub and return its ID */
async function createRepoOnGitHub(repoName, langName) {
  // TODO check if repo exists already

  // get repo login
  logger.debug(`getting organization info from github`)
  const { organization } = await graphql(
    `
      query($owner: String!) {
        organization(login: $owner) {
          id
        }
      }
    `,
    {
      owner,
      headers: {
        authorization: `token ${process.env.GITHUB_ADMIN_AUTH_TOKEN}`,
      },
    }
  )

  // create the repo in github
  logger.info(`creating repository ${repoName} on github`)
  const { createRepository } = await graphql(
    `
      mutation($input: CreateRepositoryInput!) {
        createRepository(input: $input) {
          repository {
            id
            name
            url
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_ADMIN_AUTH_TOKEN}`,
      },
      input: {
        name: repoName,
        ownerId: organization.id,
        description: `${langName} translation of the Gatsby documentation`,
        visibility: `PUBLIC`,
      },
    }
  )

  logger.debug(`successfully created repo`)
  return createRepository.repository
}

// set permissions
async function createBranchProtections(repo) {
  logger.info(`creating branch protections for ${repo.name}`)
  return await graphql(
    `
      mutation($input: CreateBranchProtectionRuleInput!) {
        createBranchProtectionRule(input: $input) {
          branchProtectionRule {
            id
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_ADMIN_AUTH_TOKEN}`,
      },
      input: {
        repositoryId: repo.id,
        pattern: branch,
        requiresCodeOwnerReviews: true,
        dismissesStaleReviews: true,
        requiresApprovingReviews: true,
        requiredApprovingReviewCount: 1,
      },
    }
  )
}
// publish issue as the bot and pin it
async function createProgressIssue(repo, langName) {
  // TODO dynamically generate the issue from docs content
  logger.info(`creating progress issue for ${repo.name}`)
  const {
    createIssue: { issue },
  } = await graphql(
    `
      mutation($input: CreateIssueInput!) {
        createIssue(input: $input) {
          issue {
            id
            url
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_BOT_AUTH_TOKEN}`,
      },
      input: {
        title: `${langName} Translation Progress`,
        body: issueBody,
        repositoryId: repo.id,
      },
    }
  )
  await graphql(
    `
      mutation($input: PinIssueInput!) {
        pinIssue(input: $input) {
          issue {
            id
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_ADMIN_AUTH_TOKEN}`,
        accept: `application/vnd.github.elektra-preview+json`,
      },
      input: {
        issueId: issue.id,
      },
    }
  )
  return issue
}

async function commentOnRequestIssue(
  issueId,
  transRepo,
  progressIssue,
  maintainers
) {
  const maintainerStr = maintainers.map(m => `@` + m).join(`, `)
  const body = `
Hi ${maintainerStr}!

Your repository [${transRepo.name}](${transRepo.url}) has been created.

Please use this [progress issue](${progressIssue.url}) to keep track of the translation progress.

If you are not already a member of the [gatsbyjs GitHub organization](https://github.com/gatsbyjs), you should have received an invitation to join. You must accept the invitation to be able to review translations! If you do not see one, please let the Gatsby team know in [an issue](${transRepo.url}/issues/new).

You're free to use the [Gatsby Discord](https://gatsby.dev/discord) to discuss translations. Ask a moderator to create a channel for you in the \`#translations\` channel.

Finally, make sure to check out the [maintainer responsibilities](https://www.gatsbyjs.org/contributing/gatsby-docs-translation-guide/#maintainer-responsibilities) and review your duties as a maintainer.

Feel free to reach out to the Gatsby team if you need any help!

Happy translating!
  `
  logger.info(`responding to original issue`)
  return await graphql(
    `
      mutation($input: AddCommentInput!) {
        addComment(input: $input) {
          clientMutationId
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_BOT_AUTH_TOKEN}`,
      },
      input: {
        subjectId: issueId,
        body,
      },
    }
  )
}

async function closeRequestIssue(issueId) {
  logger.info(`closing original issue`)
  await graphql(
    `
      mutation($input: CloseIssueInput!) {
        closeIssue(input: $input) {
          clientMutationId
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_ADMIN_AUTH_TOKEN}`,
      },
      input: { issueId },
    }
  )
}

async function setupRepository(issueNo) {
  // upload repository content
  const issue = await getIssue(issueNo)
  const { name: langName, code, maintainers } = getYamlArgs(issue.body)

  logger = log4js.getLogger(`create:` + code)
  logger.level = `info`

  logger.info(`Creating ${langName} (${code}) repo`)
  logger.info(`Maintainers: ${maintainers.join(`, `)}`)

  const transRepoName = `${projectName}-${code}`
  setupSourceRepo()
  const transRepo = await createRepoOnGitHub(transRepoName, langName)

  const [progressIssue] = await Promise.all([
    createProgressIssue(transRepo, langName),
    createBranchProtections(transRepo),
    closeRequestIssue(issue.id),
    pushSourceContent(transRepo, langName, maintainers),
    inviteMaintainers(owner, maintainers),
  ])

  await commentOnRequestIssue(issue.id, transRepo, progressIssue, maintainers)
}

const [issueNo] = process.argv.slice(2)
setupRepository(+issueNo)
