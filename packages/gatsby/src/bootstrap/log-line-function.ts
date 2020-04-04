const ext = [`log`, `warn`]

ext.forEach(function callbackfn(method: string): void {
  const old = console[method]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console[method] = function method(...rest: any[]): void {
    let stack: string[] | void = new Error().stack?.split(/\n/)

    if (stack !== undefined) {
      // Chrome includes a single "Error" line, FF doesn't.
      if (stack[0].indexOf(`Error`) === 0) {
        stack = stack.slice(1)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const args: any[] = [].slice.apply(rest)

      old.apply(console, args.concat([stack[1].trim()]))
    }
  }
})
