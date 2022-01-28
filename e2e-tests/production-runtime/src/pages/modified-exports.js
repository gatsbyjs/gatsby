import React from "react"
import UnmodifiedExports, {
  config as importedConfig,
  getServerData as importedGetServerData,
  helloWorld,
} from "../components/unmodified-exports"

function ModifiedExports() {
  return (
    <div>
      <p>This is the modified exports for page templates test page</p>
      {/* Use typeof to avoid runtime error */}
      <p data-testid="modified-exports-page-template-config">{typeof config}</p>
      <p data-testid="modified-exports-page-template-get-server-data">
        {typeof getServerData}
      </p>
      <p data-testid="unmodified-exports-page-template-config">
        {importedConfig()}
      </p>
      <p data-testid="unmodified-exports-page-template-get-server-data">
        {importedGetServerData()}
      </p>
      <p data-testid="unmodified-exports-page-template-hello-world">
        {helloWorld()}
      </p>
      <UnmodifiedExports />
    </div>
  )
}

export function config() {
  return () => "config exported from a page template module" // Expects config to be a function factory
}

export function getServerData() {
  return "getServerData exported from a page template module"
}

export default ModifiedExports
