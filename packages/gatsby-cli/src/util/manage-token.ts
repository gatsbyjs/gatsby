import { getConfigStore } from "gatsby-core-utils";
import report from "../reporter";

const tokenKey = "cli.token";
const tokenExpirationKey = "cli.tokenExpiration";

function getExpiration(): string {
  return getConfigStore().get(tokenExpirationKey);
}

export function getToken(): string {
  const expiration = getExpiration();
  const tokenHasExpired = new Date() > new Date(expiration);
  if (tokenHasExpired) {
    report.warn("Your token has expired, you may need to login again");
  }
  return getConfigStore().get(tokenKey);
}

export function setToken(token: string | null, expiration: string): void {
  const store = getConfigStore();

  store.set(tokenKey, token);
  // we would be able to decode an expiration off the JWT, but the auth service isn't set up to attach it to the token
  store.set(tokenExpirationKey, expiration);
}
