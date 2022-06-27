import { createContentDigest } from "gatsby-core-utils"

/**
 * gatsby-core-utils bundles all re-exported modules from index at present, and since it
 * has lmdb as a dependency functions bundling would fail.
 *
 * We now ignore lmdb requires during functions bundling, and as a result this should
 * bundle successfully.
 */

export default async function createDigest(_, res) {
  const digest = createContentDigest(`hello world`)
  console.info(`Cool, we made a digest we won't actually use: ${digest}`)
  res.send(`hello world`) // Return a consistent string to make assertion easier
}
