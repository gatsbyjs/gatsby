import { Actions, Reporter } from "gatsby"
import chokidar from "chokidar"
import { collectionExtractQueryString } from "./collection-extract-query-string"

/*
 * When a user is developing, they may want to mess around with the collectionQuery or renaming
 * the file, this function watches the file and if the query strings change, we delete the old
 * pages and then re-run the collection builder.
 *
 * TODO: Can we reuse the watcher from gatsby-node to avoid creating new watchers? or use a different
 *       library that is _better_ at watching files with a single global internal watcher, like watchpack.
 */
export function watchCollectionBuilder(
  absolutePath: string,
  previousQueryString: string,
  paths: Array<string>,
  actions: Actions,
  reporter: Reporter,
  rerunCollectionBuilder: () => void
): void {
  const watcher = chokidar.watch(absolutePath).on(`change`, () => {
    const queryString = collectionExtractQueryString(absolutePath, reporter)

    // if the users is changing the query to generate the pages, we need to delete the old pages
    // and re-run the builder.
    if (queryString !== previousQueryString) {
      // 1.  close the old watcher, because when we rerun the collection builder
      //     it'll create a new watcher. Just easier to code that way.
      watcher.close()

      // 2.  Make sure to delete all the old pages
      paths.forEach(path =>
        actions.deletePage({ path, component: absolutePath })
      )

      // 3.  Then run it again!
      rerunCollectionBuilder()
    }
  })
}
