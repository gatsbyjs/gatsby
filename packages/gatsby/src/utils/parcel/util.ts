import * as path from "path"

export function getParcelFile(file: string) {
  return path.join(__dirname, `..`, `..`, `internal-plugins`, `parcel`, file)
}

export function getParcelConfig(key: string) {
  return getParcelFile(`${key}.parcelrc`)
}