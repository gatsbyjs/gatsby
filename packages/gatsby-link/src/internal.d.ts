export {}

declare global {
  const __BASE_PATH__: string | undefined
  const __PATH_PREFIX__: string

  const ___loader: {
    enqueue: (...args: unknown[]) => void
    hovering: (arg: unknown) => void
  }

  interface Window {
    ___navigate(arg: unknown, options: unknown): void
    ___push(arg: unknown): void
    ___replace(arg: unknown): void
  }
}

// Temporary fix for DefinitelyTyped/DefinitelyTyped#43367.
declare module "@reach/router" {
  interface LinkProps<TState> {
    innerRef?:
      | ((el: HTMLAnchorElement) => void)
      | {
          readonly current: HTMLAnchorElement | null
        }
      | null
  }
}
