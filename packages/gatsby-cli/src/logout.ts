import reporter from "./reporter"
import { setToken } from "./util/manage-token"

/**
 * Main function that logs out of Gatsby Cloud by removing the token from the config store .
 */
export async function logout(): Promise<void> {
  await setToken(null, ``)
  reporter.info(`You have been logged out of Gatsby Cloud from this device.`)
}
