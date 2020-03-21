import { createHash } from "crypto"
import { basename } from "path"
import { execSync } from "child_process"
import gitUp from "git-up"

interface IRepositoryData {
  provider: string
  owner?: string
  name?: string
}

interface IRepositoryId {
  repositoryId: string
  repositoryData?: IRepositoryData | null
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

export const getRepoMetadata = (url: string): IRepositoryData | null => {
  try {
    // This throws for invalid urls
    const { resource: provider, pathname } = gitUp(url)
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

const hash = (str: string): string =>
  createHash(`sha256`)
    .update(str)
    .digest(`hex`)
