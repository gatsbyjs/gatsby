type Channel = "FAST_REFRESH"
type Event = [
  Channel,
  {
    action: string
    payload?: any
  }
]

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    _gatsbyEvents: Array<Event> | { push: (event: Event) => void }
  }
}

window._gatsbyEvents = window._gatsbyEvents || []

export function clearCompileError(): void {
  window._gatsbyEvents.push([`FAST_REFRESH`, { action: `CLEAR_COMPILE_ERROR` }])
}

export function clearRuntimeErrors(dismissOverlay: boolean): void {
  if (typeof dismissOverlay === `undefined` || dismissOverlay) {
    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      { action: `CLEAR_RUNTIME_ERRORS` },
    ])
  }
}

export function showCompileError(message): void {
  if (!message) {
    return
  }

  window._gatsbyEvents.push([
    `FAST_REFRESH`,
    {
      action: `SHOW_COMPILE_ERROR`,
      payload: message,
    },
  ])
}

export function showRuntimeErrors(errors): void {
  if (!errors || !errors.length) {
    return
  }

  window._gatsbyEvents.push([
    `FAST_REFRESH`,
    {
      action: `SHOW_RUNTIME_ERRORS`,
      payload: errors,
    },
  ])
}

export function isWebpackCompileError(error): boolean {
  return (
    /Module [A-z ]+\(from/.test(error.message) ||
    /Cannot find module/.test(error.message)
  )
}

export function handleRuntimeError(error): void {
  if (error && !isWebpackCompileError(error)) {
    window._gatsbyEvents.push([
      `FAST_REFRESH`,
      {
        action: `HANDLE_RUNTIME_ERROR`,
        payload: [error],
      },
    ])
  }
}
