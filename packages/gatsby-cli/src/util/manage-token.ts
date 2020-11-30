import { getConfigStore } from "gatsby-core-utils"
import report from "../reporter"

const tokenKey = `cli.token`
const tokenExpirationKey = `cli.tokenExpiration`

const getExpiration = (): string => getConfigStore().get(tokenExpirationKey)
export const getToken = async (): Promise<string> => {
  const expiration = await getExpiration()
  const tokenHasExpired = new Date() > new Date(expiration)
  if (tokenHasExpired) {
    report.warn(`Your token has expired, you may need to login again`)
  }
  return getConfigStore().get(tokenKey)
}

export const setToken = (token: string | null, expiration: string): void => {
  const store = getConfigStore()

  store.set(tokenKey, token)
  // we would be able to decode an expiration off the JWT, but the auth service isn't set up to attach it to the token
  store.set(tokenExpirationKey, expiration)
}
