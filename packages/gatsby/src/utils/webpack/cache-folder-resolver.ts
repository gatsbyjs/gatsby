import Resolver from "enhanced-resolve/lib/Resolver"

interface IRequest {
  request?: string
  path: string
}

type ProcessWithPNP = NodeJS.ProcessVersions & { pnp?: string }

/**
 * To support PNP we have to make sure dependencies resolved from the .cache folder should be resolved from the gatsby package directory
 */
export class CacheFolderResolver {
  private requestsFolder: string

  constructor(requestsFolder: string) {
    this.requestsFolder = requestsFolder
  }

  apply(resolver: Resolver): void {
    if (!(process.versions as ProcessWithPNP).pnp) {
      return
    }

    const target = resolver.ensureHook(`raw-module`)
    resolver
      .getHook(`raw-module`)
      .tapAsync(
        `CacheFolderResolver`,
        (
          request: IRequest,
          resolveContext: unknown,
          callback: (err?: Error | null, result?: unknown) => void
        ) => {
          const req = request.request
          if (!req) {
            return callback()
          }

          if (!request.path.startsWith(this.requestsFolder)) {
            return callback()
          }

          const packageMatch = /^(@[^/]+\/)?[^/]+/.exec(req)
          if (!packageMatch) {
            return callback()
          }

          // We change the issuer but keep everything as is and re-run resolve
          const obj = {
            ...request,
            path: __dirname,
          }

          return resolver.doResolve(
            target,
            obj,
            `change issuer to gatsby package by cache-folder-resolver to fix pnp`,
            resolveContext,
            (err, result) => {
              if (err) {
                return callback(err)
              }

              if (result) {
                return callback(null, result)
              }

              // Skip alternatives
              return callback(null, null)
            }
          )
        }
      )
  }
}
