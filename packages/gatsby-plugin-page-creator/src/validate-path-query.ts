import _ from "lodash"
import systemPath from "path"

export function validatePathQuery(
  filePath: string,
  extensions: Array<string>
): void {
  // Paths must start with /
  if (filePath.startsWith(`/`) !== true) {
    throw new Error(`PageCreator: To query node "gatsbyPath" the "filePath" argument must be an absolute path, starting with a /
Please change this to: "/${filePath}"`)
  }

  // Paths must not include file extension
  if (/\.[a-z]+$/i.test(filePath)) {
    throw new Error(`PageCreator: To query node "gatsbyPath" the "filePath" argument must omit the file extension
Please change ${filePath} to "${filePath.replace(/\.[a-z]+$/i, ``)}"`)
  }

  // Paths must not utilize src/pages
  if (filePath.includes(`src/pages`)) {
    throw new Error(`PageCreator: To query node "gatsbyPath" the "filePath" argument must omit the src/pages prefix.
Please change this to: "${filePath.replace(/\/?src\/pages\//, ``)}"`)
  }

  // Paths must not include index
  if (/index$/.test(filePath)) {
    throw new Error(
      `PageCreator: To query node "gatsbyPath" the "filePath" argument must omit index.
Please change this to: "${filePath.replace(/index$/, ``)}"`
    )
  }

  const absolutePath = systemPath.join(process.cwd(), `src/pages`, filePath)

  const file = _.flatten(
    extensions.map(ext =>
      [``, `${systemPath.sep}index`].map(index => {
        try {
          return require.resolve(absolutePath + index + ext)
        } catch (e) {
          return false
        }
      })
    )
  ).filter(Boolean) as Array<string>

  if (file.length === 0 || file[0].length === 0) {
    throw new Error(
      `PageCreator: To query node "gatsbyPath" the "filePath" argument must represent a file that exists.
Unable to find a file at: "${absolutePath}"`
    )
  }
}
