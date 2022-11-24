import React from "react"

function UnmodifiedExports() {
  return (
    <div>
      <p data-testid="unmodified-exports-config">{config()}</p>
      <p data-testid="unmodified-exports-get-server-data">{getServerData()}</p>
      <p data-testid="unmodified-exports-hello-world">{helloWorld()}</p>
    </div>
  )
}

export function config() {
  return "config exported from a non-page template module"
}

export function getServerData() {
  return "getServerData exported from a non-page template module"
}

export function helloWorld() {
  return "hello world"
}

export default UnmodifiedExports
