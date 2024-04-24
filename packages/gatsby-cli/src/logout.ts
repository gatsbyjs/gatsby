import reporter from "./reporter";
import { setToken } from "./util/manage-token";

/**
 * Main function that logs out of Gatsby Cloud by removing the token from the config store.
 */
export function logout(): void {
  setToken(null, "");
  reporter.info("You have been logged out of Gatsby Cloud from this device.");
}
