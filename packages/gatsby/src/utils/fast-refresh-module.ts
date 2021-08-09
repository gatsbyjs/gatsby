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

// Use `self` here instead of `window` so it works in non-window environments (like Workers)
self._gatsbyEvents = self._gatsbyEvents || []

export function clearCompileError(): void {
  self._gatsbyEvents.push([`FAST_REFRESH`, { action: `CLEAR_COMPILE_ERROR` }])
}

export function clearRuntimeErrors(dismissOverlay: boolean): void {
  if (typeof dismissOverlay === `undefined` || dismissOverlay) {
    self._gatsbyEvents.push([
      `FAST_REFRESH`,
      { action: `CLEAR_RUNTIME_ERRORS` },
    ])
  }
}

export function showCompileError(message): void {
  if (!message) {
    return
  }

  self._gatsbyEvents.push([
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

  self._gatsbyEvents.push([
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
    self._gatsbyEvents.push([
      `FAST_REFRESH`,
      {
        action: `HANDLE_RUNTIME_ERROR`,
        payload: [error],
      },
    ])
  }
}
