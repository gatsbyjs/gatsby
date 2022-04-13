import * as path from "path"

export function getParcelConfig(key: string) {
  return path.join(__dirname, `..`, `..`, `internal-plugins`, `parcel`, `${key}.parcelrc`)
}