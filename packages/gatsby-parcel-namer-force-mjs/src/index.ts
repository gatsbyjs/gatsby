import { Namer } from "@parcel/plugin"
import { FilePath } from "@parcel/types"
import path from "path"

const GATSBY_FILE_NAMES = [`gatsby-node`, `gatsby-config`]

export default new Namer({
  async name({ bundle }): Promise<FilePath | null | undefined> {
    const filePath = bundle.getMainEntry()?.filePath
    if (!filePath) {
      return null
    }
    const fileName = path.parse(filePath).name

    if (GATSBY_FILE_NAMES.includes(fileName)) {
      return `${fileName}.mjs`
    }

    return null
  },
})
