import { Namer } from "@parcel/plugin"
import { FilePath, Namer as NamerOpts } from "@parcel/types"
import defaultNamer from "@parcel/namer-default"
import * as path from "path"
import { slash } from "gatsby-core-utils"

const CONFIG = Symbol.for(`parcel-plugin-config`)
const defaultNamerOpts = defaultNamer[CONFIG] as NamerOpts<unknown>

export default new Namer({
  async name(opts): Promise<FilePath | null | undefined> {
    // @parcel/namer-default will find "most common denominator" directory
    // depending on entries and make it a "relative root" for output.
    // This means that output is not deterministic based JUST on configuration
    // as adding/removing entries can change output directory structure.
    // To make it deterministic we add "middleware" namer which will use
    // @parcel/namer-default for filename, but (possibly) adjust directory
    // structure.

    const relativePathFromDefaultNamer = await defaultNamerOpts.name(opts)
    if (relativePathFromDefaultNamer) {
      const mainEntry = opts.bundle.getMainEntry()
      if (!mainEntry) {
        return null
      }

      // For now treating CWD as root. For current gatsby use case
      // this is enough, for various other projects it might need to be configurable
      // or just smarter (for example cover common dirs like `src` or `lib` etc)
      const root = slash(process.cwd())

      const sourceRelativeToRoot = path.posix.relative(
        root,
        slash(path.dirname(mainEntry.filePath))
      )

      // newPath will be output relative to "distDir".
      // we want to preserve directory structure in distDir that we have
      // between entries and root
      const newPath = path.posix.join(
        sourceRelativeToRoot,
        path.basename(relativePathFromDefaultNamer)
      )

      return newPath
    }

    return null
  },
})
