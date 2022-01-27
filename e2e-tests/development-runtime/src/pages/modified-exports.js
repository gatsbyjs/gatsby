import React from "react"
import UnmodifiedExports from "../components/unmodified-exports"

function ModifiedExports() {
  return (
    <div>
      <p>This is the modified exports for page templates test page</p>
      {/* Use typeof to avoid runtime error */}
      <p data-testid="modified-exports-config">{typeof config}</p>
      <p data-testid="modified-exports-get-server-data">
        {typeof getServerData}
      </p>
      <UnmodifiedExports />
    </div>
  )
}

export function config() {
  return "config exported from a page template module"
}

export function getServerData() {
  return "getServerData exported from a page template module"
}

export default ModifiedExports
