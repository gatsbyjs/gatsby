const didCallServer = new Set()

const postToServer = chunkName => {
  if (!didCallServer.has(chunkName)) {
    const req = new XMLHttpRequest()
    req.open(`post`, `/___client-page-visited`, true)
    req.setRequestHeader(`Content-Type`, `application/json;charset=UTF-8`)
    req.send(JSON.stringify({ chunkName }))

    didCallServer.add(chunkName)
  }
}

export default postToServer
