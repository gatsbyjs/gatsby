export function emitRoutes(routes) {
  if (!process.send) {
    return
  }

  process.send({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_ROUTE`,
      payload: {
        routes,
      },
    },
  })
}

export function emitRedirects(redirect) {
  if (!process.send) {
    return
  }

  process.send({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_REDIRECT_ENTRY`,
      payload: redirect,
    },
  })
}

export function emitRewrites(rewrite) {
  if (!process.send) {
    return
  }

  process.send({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_REWRITE_ENTRY`,
      payload: rewrite,
    },
  })
}

export function emitHeaders(header) {
  if (!process.send) {
    return
  }

  process.send({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_HEADER_ENTRY`,
      payload: header,
    },
  })
}
