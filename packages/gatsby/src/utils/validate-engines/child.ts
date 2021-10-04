import mod from "module"
import * as path from "path"

const allowedPrefixes = [`.cache/query-engine`, `.cache/page-ssr`]

// @ts-ignore TS doesn't like accessing `_load`
const originalModuleLoad = mod._load

export async function validate(directory: string): Promise<void> {
  // intercept module loading and validate no unexpected imports are happening
  // @ts-ignore TS doesn't like accessing `_load`
  mod._load = (request, parent, isMain): any => {
    // allow all node builtins
    if (mod.builtinModules.includes(request)) {
      return originalModuleLoad(request, parent, isMain)
    }

    // if it's not node builtin, check if import is for engine or engine internals
    const localRequire = mod.createRequire(parent.filename)
    const absPath = localRequire.resolve(request)

    const relativeToRoot = path.relative(directory, absPath)
    for (const allowedPrefix of allowedPrefixes) {
      if (relativeToRoot.startsWith(allowedPrefix)) {
        return originalModuleLoad(request, parent, isMain)
      }
    }

    // We throw on anything that is not allowed
    // Runtime might have try/catch for it and continue to work
    // (for example`msgpackr` have fallback if native `msgpack-extract` can't be loaded)
    // and we don't fail validation in those cases because error we throw will be handled.
    // We do want to fail validation if there is no fallback
    throw new Error(
      `Not allowed import "${request}" ("${relativeToRoot}") from "${parent.id}"`
    )
  }

  // workaround for gatsby-worker issue:
  // gatsby-worker gets bundled in engines and it will auto-init "child" module
  // if GATSBY_WORKER_MODULE_PATH env var is set. To prevent this we just unset
  // env var so it's falsy.
  process.env.GATSBY_WORKER_MODULE_PATH = ``

  // import engines, initiate them, if there is any error thrown it will be handled in parent process
  const { GraphQLEngine } = require(path.join(
    directory,
    `.cache`,
    `query-engine`
  ))
  require(path.join(directory, `.cache`, `page-ssr`))
  const graphqlEngine = new GraphQLEngine({
    dbPath: path.join(directory, `.cache`, `data`, `datastore`),
  })
  await graphqlEngine.ready()
}
