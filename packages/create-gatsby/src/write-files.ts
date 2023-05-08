import fs from "fs-extra"
import path from "path"
import { IFile } from "."
function createDirectories(filepath: string): string {
  // Split the filepath into directories and filename
  const dirs = filepath.split(path.sep)
  const filename = dirs.pop() || ``
  let dirPath = ``

  // Create each directory in the filepath if it does not exist
  for (const dir of dirs) {
    dirPath = path.join(dirPath, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
  }

  // Return the full filepath with the filename
  return path.join(dirPath, filename)
}

function writeFile(sourceFile: string, filepath: string): void {
  const data = fs.readFileSync(sourceFile)
  // Create the directories if they do not exist
  const fullpath = createDirectories(filepath)
  // Write the file
  fs.writeFileSync(fullpath, data)
}

export async function writeFiles(
  rootPath: string,
  files: Array<IFile> | undefined
): Promise<void> {
  const parentDir = path.join(__dirname, `..`)
  files?.forEach(({ source, targetPath }) => {
    const fullPath = path.join(rootPath, targetPath)
    const sourcePath = path.resolve(parentDir, source)
    writeFile(sourcePath, fullPath)
  })
}
