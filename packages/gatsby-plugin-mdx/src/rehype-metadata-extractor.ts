import type { Plugin } from "unified"

const rehypeMdxMetadataExtractor: Plugin = function () {
  const metadata = {}
  // eslint-disable-next-line @babel/no-invalid-this
  this.data(`mdxMetadata`, metadata)
  return (_tree, file): void => {
    Object.assign(metadata, file.data.meta)
    // console.dir({ metadata, file })
  }
}

export default rehypeMdxMetadataExtractor
