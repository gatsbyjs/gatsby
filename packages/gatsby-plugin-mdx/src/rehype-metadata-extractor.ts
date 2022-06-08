import type { Plugin } from "unified"

/**
 * This plugin extracts metadata from the file and stores it
 * within the unified processor data for later extraction.
 */
const rehypeMdxMetadataExtractor: Plugin = function () {
  const metadata = {}
  // eslint-disable-next-line @babel/no-invalid-this
  this.data(`mdxMetadata`, metadata)
  return (_tree, file): void => {
    Object.assign(metadata, file.data.meta)
  }
}

export default rehypeMdxMetadataExtractor
