import * as fs from "fs-extra"
import path from "path"

export interface IFile {
  source: string
  targetPath: string
}

async function writeFile({ source, targetPath }: IFile): Promise<void> {
  // Read the stub
  const stubData = await fs.readFile(source)
  // Write stub to targetPath
  await fs.outputFile(targetPath, stubData)
}

export async function writeFiles(
  rootPath: string,
  files: Array<IFile> | undefined
): Promise<void> {
  if (!files) {
    return
  }

  // Necessary to grab files from the stub/ dir
  const createGatsbyRoot = path.join(__dirname, `..`)
  // Creating files in parallel
  const results = []

  for (const file of files) {
    const source = path.resolve(createGatsbyRoot, file.source)
    const targetPath = path.resolve(rootPath, file.targetPath)

    results.push(writeFile({ source, targetPath }))
  }

  await Promise.all(results)
}
