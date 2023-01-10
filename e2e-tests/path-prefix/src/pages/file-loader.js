import * as React from "react"

// Test files that are handled by file-loader
import logo from "../images/citrus-fruits.jpg"

export default function FileLoaderPage() {
  return <img src={logo} alt="Citrus fruits" data-testid="file-loader-image" />
}
