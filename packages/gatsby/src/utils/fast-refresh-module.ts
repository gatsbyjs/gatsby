import mitt from "mitt"

declare global {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface Window {
    ___emitter: mitt.Emitter
  }
}

export function clearCompileError(): void {
  window.___emitter.emit(`FAST_REFRESH`, { action: `CLEAR_COMPILE_ERROR` })
}

export function clearRuntimeErrors(hasRuntimeErrors): void {
  if (typeof hasRuntimeErrors !== `undefined`) {
    // Fast Refresh weird behavior
    window.___emitter.emit(`FAST_REFRESH`, { action: `CLEAR_RUNTIME_ERRORS` })
  }
}

export function showCompileError(message): void {
  if (!message) {
    return
  }

  window.___emitter.emit(`FAST_REFRESH`, {
    action: `SHOW_COMPILE_ERROR`,
    payload: message,
  })
}

export function showRuntimeErrors(errors): void {
  if (!errors || !errors.length) {
    return
  }

  window.___emitter.emit(`FAST_REFRESH`, {
    action: `SHOW_RUNTIME_ERRORS`,
    payload: errors,
  })
}

export function isWebpackCompileError(error): boolean {
  return (
    /Module [A-z ]+\(from/.test(error.message) ||
    /Cannot find module/.test(error.message)
  )
}

export function handleRuntimeError(error): void {
  if (error && !isWebpackCompileError(error)) {
    window.___emitter.emit(`FAST_REFRESH`, {
      action: `HANDLE_RUNTIME_ERROR`,
      payload: [error],
    })
  }
}
