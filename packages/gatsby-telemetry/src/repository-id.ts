import { createHash } from "crypto"
import { basename } from "path"
import { execSync } from "child_process"
import gitUp from "git-up"

// there are no types for git-up, so we create our own
// based on https://github.com/IonicaBizau/git-up/blob/60e6a4ff93d50360bbb80953bfab2f82d3418900/lib/index.js#L8-L28
const typedGitUp = gitUp as (
  input: string
) => { resource: string; pathname: string }

interface IRepositoryData {
  provider: string
  owner?: string
  name?: string
}

interface IRepositoryId {
  repositoryId: string
  repositoryData?: IRepositoryData | null
}

const hash = (str: string): string =>
  createHash(`sha256`).update(str).digest(`hex`)

export const getRepoMetadata = (url: string): IRepositoryData | null => {
  try {
    // This throws for invalid urls
    const { resource: provider, pathname } = typedGitUp(url)

    const res: IRepositoryData = { provider: hash(provider) }

    const userAndRepo = pathname.split(`/`)
    if (userAndRepo.length == 3) {
      res.owner = hash(userAndRepo[1])
      res.name = hash(userAndRepo[2].replace(`.git`, ``))
    }

    return res
  } catch (e) {
    // ignore
  }
  return null
}

const getRepositoryIdFromPath = (): string => basename(process.cwd())

const getGitRemoteWithGit = (): IRepositoryId | null => {
  try {
    // we may live multiple levels in git repo
    const originBuffer = execSync(
      `git config --local --get remote.origin.url`,
      { timeout: 1000, stdio: `pipe` }
    )
    const repo = String(originBuffer).trim()
    if (repo) {
      return {
        repositoryId: `git:${hash(repo)}`,
        repositoryData: getRepoMetadata(repo),
      }
    }
  } catch (e) {
    // ignore
  }
  return null
}

const getRepositoryFromNetlifyEnv = (): IRepositoryId | null => {
  if (process.env.NETLIFY) {
    try {
      const url = process.env.REPOSITORY_URL!
      const repoPart = url.split(`@`)[1]
      if (repoPart) {
        return {
          repositoryId: `git:${hash(repoPart)}`,
          repositoryData: getRepoMetadata(url),
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return null
}

export const getRepositoryId = (): IRepositoryId => {
  const gitRepo = getGitRemoteWithGit() || getRepositoryFromNetlifyEnv()
  if (gitRepo) {
    return gitRepo
  } else {
    const repo = getRepositoryIdFromPath()
    return { repositoryId: `pwd:${hash(repo)}` }
  }
}
