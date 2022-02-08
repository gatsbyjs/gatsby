import path from "path"
import { getLmdb } from "./get-lmdb"
import type { RootDatabase, Database } from "lmdb"
import type { Headers } from "got"

export enum LockStatus {
  Locked = 0,
  Unlocked = 1,
}

interface ICoreUtilsDatabase {
  remoteFileInfo: Database<
    {
      extension: string
      headers: Headers
      path: string
      directory: string
      cacheKey?: string
      buildId: string
    },
    string
  >
  mutex: Database<LockStatus, string>
}

let databases: ICoreUtilsDatabase | undefined
let rootDb: RootDatabase

export function getDatabaseDir(): string {
  const rootDir = global.__GATSBY?.root ?? process.cwd()
  return path.join(rootDir, `.cache`, `data`, `gatsby-core-utils`)
}

export function getStorage(fullDbPath: string): ICoreUtilsDatabase {
  if (!databases) {
    if (!fullDbPath) {
      throw new Error(`LMDB path is not set!`)
    }

    const open = getLmdb().open

    rootDb = open({
      name: `root`,
      path: fullDbPath,
      compression: true,
      sharedStructuresKey: Symbol.for(`structures`),
    })

    databases = {
      remoteFileInfo: rootDb.openDB({
        name: `remote-file`,
      }),
      mutex: rootDb.openDB({
        name: `mutex`,
      }),
    }
  }

  return databases as ICoreUtilsDatabase
}

export async function closeDatabase(): Promise<void> {
  if (rootDb) {
    await rootDb.close()
  }
}
