import mod from "module"
import * as path from "path"

// @ts-ignore TS doesn't like accessing `_load`
const originalModuleLoad = mod._load

class EngineValidationError extends Error {
  request: string
  relativeToRoot: string
  parentPath: string

  constructor({
    request,
    relativeToRoot,
    parent,
  }: {
    request: string
    relativeToRoot: string
    parent: mod
  }) {
    super(
      `Generated engines use disallowed import "${request}". Only allowed imports are to Node.js builtin modules or engines internals.`
    )
    this.request = request
    this.relativeToRoot = relativeToRoot
    this.parentPath = parent.filename
  }
}

export async function validate(directory: string): Promise<void> {
  // intercept module loading and validate no unexpected imports are happening
  // @ts-ignore TS doesn't like accessing `_load`
  mod._load = (request: string, parent: mod, isMain: boolean): any => {
    // Allow all node builtins
    if (mod.builtinModules.includes(request)) {
      return originalModuleLoad(request, parent, isMain)
    }

    // Allow imports to modules in engines directory.
    // For example: importing ".cache/page-ssr/routes/render-page" from
    // page-ssr engine should be allowed as it is part of engine.
    const allowedPrefixes = [
      path.join(`.cache`, `query-engine`),
      path.join(`.cache`, `page-ssr`),
    ]
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
    throw new EngineValidationError({ request, relativeToRoot, parent })
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
