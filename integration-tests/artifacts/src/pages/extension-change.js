import * as React from "react"
import { extension } from "../components/file-that-will-change-extension"

export default function PageThatIsImportingFileWithoutSpecyfingExtension() {
  return <div>extension of imported file: {extension}</div>
}
