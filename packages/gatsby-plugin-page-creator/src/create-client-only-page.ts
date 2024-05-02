// import type { Actions } from "gatsby";
import {
  createPath,
  applyTrailingSlashOption,
  type TrailingSlash,
} from "gatsby-page-utils";
import { getMatchPath } from "gatsby-core-utils";

// Create a client side page with a matchPath
// based on the `[]` existing in it's file path.
// e.g., a file named `src/pages/foo/[bar].js`
// gets created at the url: `foo/:bar`
export function createClientOnlyPage(
  filePath: string,
  absolutePath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: any, // Actions,
  trailingSlash: TrailingSlash,
): void {
  const path = createPath(filePath);
  const modifiedPath = applyTrailingSlashOption(path, trailingSlash);

  actions.createPage({
    path: modifiedPath,
    matchPath: getMatchPath(path),
    component: absolutePath,
    context: {},
  });
}
