import { Namer } from "@parcel/plugin"
import type { FilePath, Namer as NamerOpts } from "@parcel/types"
import gatsbyParcelNamerRelativeToCwd from "@gatsbyjs/parcel-namer-relative-to-cwd"
import * as path from "path"

const CONFIG = Symbol.for(`parcel-plugin-config`)
const relativeNameOpts = gatsbyParcelNamerRelativeToCwd[
  CONFIG
] as NamerOpts<unknown>

export default new Namer({
  async name(opts): Promise<FilePath | null | undefined> {
    const relativeName = await relativeNameOpts.name(opts)

    if (relativeName) {
      const { dir, name } = path.parse(relativeName)
      return `${dir}/${name}.mjs`
    }

    return null
  },
})
