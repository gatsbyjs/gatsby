let isEnabled = detect()

export function isLmdbStore(): boolean {
  return isEnabled
}

export function detectLmdbStore(): void {
  isEnabled = detect()
}

function detect(): boolean {
  return (
    Boolean(process.env.GATSBY_EXPERIMENTAL_LMDB_STORE) &&
    process.env.GATSBY_EXPERIMENTAL_LMDB_STORE !== `false` &&
    process.env.GATSBY_EXPERIMENTAL_LMDB_STORE !== `0`
  )
}
