/**
 * TODO
 * Use real pages from gatsbyjs.org + generate fake page structure
 * Actually, spider a few dozen real-world Gatsby sites + other sites to
 * get collections of pathnames https://www.npmjs.com/package/node-spider
 *
 * For very large blogs and like, would be good to have sorted array
 * implementation so for pagination, aren't getting 10 different buckets of
 * metadata for each pagination segment.
 *
 * ~215 bytes metadata / page
 *
 * Means ~150 pages is ~32.25 kb.
 *
 * Group by component as well? That save non-gzipped space.
 *
 * Write package, tests, etc.
 */

const mod = require(`hash-mod`)(10000)
const _ = require(`lodash`)

module.exports = originalPaths => {
  originalPaths = _.uniq(originalPaths)

  const splitPaths = originalPaths.map(p => {
    const page = {}
    page.path = p
    page.splits = _.trim(p, `/`).split(`/`)
    return page
  })

  const pathBucket = {
    ___paths: [],
    children: {},
    parentPath: false,
  }

  let bundles = [{ name: `topLevel`, paths: [] }]

  const OPTIMAL_BUCKET_SIZE = 500

  const putInBucket = (path, page, parentBucket, depth = 1, parentPath) => {
    if (path.length === 0) {
      return
    }

    // Add the home page and any top level index pages to the
    // topLevel bundle and return.
    if (depth === 1 && depth === page.splits.length) {
      bundles[0].paths.push(page.path)
      return
    }

    const key = path[0]

    // If there's already a child path segment for this new path
    // then add it on.
    if (parentBucket.children[key]) {
      const bucket = parentBucket.children[key]
      const paths = bucket[`___paths`]

      paths.push(page.path)
      bucket[`___paths`] = paths

      putInBucket(
        path.slice(1),
        page,
        bucket,
        depth + 1,
        parentPath ? `${parentPath}/${key}` : key
      )
      // Else, create a new child bucket and add the path
    } else {
      const bucket = {
        ___key: key,
        children: {},
        parentPath,
      }

      const paths = [page.path]
      bucket[`___paths`] = paths
      parentBucket.children[key] = bucket

      putInBucket(
        path.slice(1),
        page,
        bucket,
        depth + 1,
        parentPath ? `${parentPath}/${key}` : key
      )
    }
  }

  splitPaths.forEach(p => {
    putInBucket(p.splits, p, pathBucket, 1, false)
  })

  function recurse(currentNode, key) {
    if (currentNode.parentPath) {
      if (
        37 < currentNode.___paths.length &&
        currentNode.___paths.length < OPTIMAL_BUCKET_SIZE
      ) {
        bundles.push({
          name: currentNode.parentPath
            ? `${currentNode.parentPath}/${currentNode.___key}`
            : currentNode.___key,
          paths: currentNode.___paths,
        })
        return null
      } else if (currentNode.___paths.length < 37) {
        return key
      }
    }

    let keys = []
    _.each(currentNode.children, (value, key) => {
      keys.push(recurse(value, key))
    })

    keys = keys.filter(Boolean)

    console.log(
      `making misc`,
      currentNode.parentPath,
      currentNode.___key,
      keys.length
    )
    if (keys.length > 0) {
      bundles.push({
        name: currentNode.parentPath
          ? `${_.trim(currentNode.parentPath, `/`)}/misc`
          : currentNode.___key
            ? `${currentNode.___key}/misc`
            : `misc`,
        paths: _.flatten(keys.map(k => currentNode.children[k].___paths)),
      })
      // }
      // {
      // console.log({
      // currentNode,
      // keys: keys,
      // hi: keys.map(k => currentNode.children[k].___paths),
      // })
      // }
    }
  }

  // _.each(pathBucket.children, bucket => recurse(bucket))
  recurse(pathBucket)

  bundles = _.sortBy(bundles, b => b.name)

  bundles.forEach(b => console.log(b.name, b.paths.length))
  let total = []
  bundles.forEach(b => {
    total = total.concat(b.paths)
  })
  console.log({ total: total.length, pathsTotal: originalPaths.length })
  console.log(`missing`, _.difference(originalPaths, total))
  console.log(
    `duplicates`,
    _(total)
      .groupBy()
      .pickBy(x => x.length > 1)
      .keys()
      .value()
  )
  // console.log(bundles.find(b => b.name === `blog`))
}
