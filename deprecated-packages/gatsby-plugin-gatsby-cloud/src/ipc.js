function sendOrPromise(msg) {
  if (!process.send) {
    return false
  }
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  // `process.send` can buffer messages and delay their delivery. In this case it returns false.
  //  if process exists before all messages in the buffer are processed - remaining messages will be lost.
  //
  //  The function returns sync `true` when message is handled immediately and Promise when
  //  it is buffered (this is essentially a backpressure for lots of sync calls to `process.send`).
  //
  //  Callers must `await` results of this function to ensure process doesn't exit early.
  //
  // See also https://github.com/nodejs/node/issues/7657#issuecomment-253744600
  // and https://nodejs.org/dist/latest-v14.x/docs/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback
  //
  const sent = process.send(msg, error => {
    if (error) {
      reject(error)
    } else {
      resolve(true)
    }
  })
  return sent === false ? promise : true
}

export function emitRoutes(routes) {
  return sendOrPromise({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_ROUTE`,
      payload: {
        routes,
      },
    },
  })
}

export function emitTotalRenderedPageCount(totalRenderedPageCount) {
  return sendOrPromise({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_TOTAL_RENDERED_PAGE_COUNT`,
      payload: {
        totalRenderedPageCount,
      },
    },
  })
}

export function emitRedirects(redirect) {
  return sendOrPromise({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_REDIRECT_ENTRY`,
      payload: redirect,
    },
  })
}

export function emitRewrites(rewrite) {
  return sendOrPromise({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_REWRITE_ENTRY`,
      payload: rewrite,
    },
  })
}

export function emitHeaders(header) {
  return sendOrPromise({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_HEADER_ENTRY`,
      payload: header,
    },
  })
}

export function emitFileNodes(file) {
  return sendOrPromise({
    type: `LOG_ACTION`,
    action: {
      type: `CREATE_FILE_NODE`,
      payload: file,
    },
  })
}
