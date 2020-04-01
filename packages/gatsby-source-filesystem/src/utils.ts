import * as path from "path"
import * as Url from "url"
import ProgressBar from "progress"
import { Reporter } from "gatsby"

/**
 * Parses remote url to a path object
 */
function getParsedPath(url: string): path.ParsedPath {
  return path.parse(Url.parse(url).pathname as string)
}

/**
 * Parses remote url to retrieve remote file extension
 */
export function getRemoteFileExtension(url: string): string {
  return getParsedPath(url).ext
}

/**
 * Parses remote url to retrieve remote file name
 */
export function getRemoteFileName(url: string): string {
  return getParsedPath(url).name
}

export interface IProgressReport {
  start: () => void
  tick: () => void
  done: () => void
  total: number
}

// TODO remove in V3
export function createProgress(message, reporter?: Reporter): IProgressReport {
  if (reporter && reporter.createProgress) {
    return reporter.createProgress(message)
  }

  const bar = new ProgressBar(
    ` [:bar] :current/:total :elapsed s :percent ${message}`,
    {
      total: 0,
      width: 30,
      clear: true,
    }
  )

  return {
    start(): void {},
    tick(): void {
      bar.tick()
    },
    done(): void {},
    set total(value) {
      bar.total = value
    },
  }
}

/**
 * creates a valid file path
 */
export function createFilePath(
  directory: string,
  filename: string,
  ext: string
): string {
  return path.join(directory, `${filename}${ext}`)
}
