import { Actions } from "gatsby"
import chokidar from "chokidar"
import { collectionExtractQueryString } from "./collection-extract-query-string"

/*
 * When a user is developing, they may want to mess around with the unstable_createPagesFromData
 * query, this function watches the file and if the query strings change, we delete the old
 * pages and then re-run the collection builder.
 */
export function watchCollectionBuilder(
  absolutePath: string,
  previousQueryString: string,
  paths: string[],
  actions: Actions,
  rerunCollectionBuilder: () => void
): void {
  const watcher = chokidar.watch(absolutePath).on(`change`, () => {
    const queryString = collectionExtractQueryString(absolutePath)

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
