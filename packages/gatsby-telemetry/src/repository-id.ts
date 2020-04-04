import { createHash } from 'crypto'
import { basename } from 'path'
import { execSync } from 'child_process'
import gitUp from 'git-up'

const REPOSITORY_URL: string | void = process.env.REPOSITORY_URL;
const NETLIFY: string | void = process.env.NETLIFY

export interface RepoMetaData {
  provider: string;
  owner?: string;
  name?: string;
}

export interface GitRepoMetaData {
  repositoryId: string;
  repositoryData?: RepoMetaData | null;
}

export function getRepositoryId (): GitRepoMetaData {
  const gitRepo: GitRepoMetaData | null = getGitRemoteWithGit() || getRepositoryFromNetlifyEnv()

  if (gitRepo !== null) {
    return gitRepo
  } else {
    const repo: string = getRepositoryIdFromPath()

    return { repositoryId: `pwd:${hash(repo)}` }
  }
}

export function getRepoMetadata (url: string): RepoMetaData | null {
  try {
    // This throws for invalid urls
    const { resource: provider, pathname } = gitUp(url)

    const res: RepoMetaData = { provider: hash(provider) }

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

function getRepositoryIdFromPath (): string {
  return basename(process.cwd())
}

function getGitRemoteWithGit (): GitRepoMetaData | null {
  try {
    // we may live multiple levels in git repo
    const originBuffer = execSync(`git config --local --get remote.origin.url`, { timeout: 1000, stdio: 'pipe' })

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

function getRepositoryFromNetlifyEnv (): GitRepoMetaData | null {
  if (NETLIFY !== undefined && REPOSITORY_URL !== undefined) {
    try {
      const repoPart = REPOSITORY_URL.split(`@`)[1]

      if (repoPart) {
        return {
          repositoryId: `git:${hash(repoPart)}`,
          repositoryData: getRepoMetadata(REPOSITORY_URL),
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return null
}

function hash (str: string): string {
  return createHash(`sha256`)
    .update(str)
    .digest(`hex`)
}
