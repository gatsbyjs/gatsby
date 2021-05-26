let isEnabled = detect()

export function isStrictMode(): boolean {
  return isEnabled
}

export function detectStrictMode(): void {
  isEnabled = detect()
}

function detect(): boolean {
  return (
    Boolean(process.env.GATSBY_EXPERIMENTAL_STRICT_MODE) &&
    process.env.GATSBY_EXPERIMENTAL_STRICT_MODE !== `false` &&
    process.env.GATSBY_EXPERIMENTAL_STRICT_MODE !== `0`
  )
}
