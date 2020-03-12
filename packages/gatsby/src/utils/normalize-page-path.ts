// This is a duplicate of the runtime util
// file cache-dir/normalize-page-path.js
// While still a duplicate, this one is
// rewritten in typescript
export function normalizePagePath(path: string): string {
  if (path === undefined) {
    return path
  }
  if (path === `/`) {
    return `/`
  }
  if (path.charAt(path.length - 1) === `/`) {
    return path.slice(0, -1)
  }
  return path
}

export function denormalizePagePath(path: string): string {
  if (path === undefined) {
    return path
  }
  if (path === `/`) {
    return `/`
  }
  if (path.charAt(path.length - 1) !== `/`) {
    return path + `/`
  }
  return path
}
