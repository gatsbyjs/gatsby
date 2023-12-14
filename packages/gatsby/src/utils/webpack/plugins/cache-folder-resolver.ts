import Resolver from "enhanced-resolve/lib/Resolver"
import mod from "module"

interface IRequest {
  request?: string
  path: string
}

/**
 * To support PNP we have to make sure dependencies resolved from the .cache folder should be resolved from the gatsby package directory
 */
export class CacheFolderResolver {
  private requestsFolder: string
  private isEnabled = false

  constructor(requestsFolder: string) {
    this.requestsFolder = requestsFolder

    const cacheDirReq = mod.createRequire(requestsFolder)

    let isEverythingResolvableFromCacheDir = true
    let isEverythingResolvableFromGatsbyPackage = true

    // Hardcoded list of gatsby deps used in gatsby browser and ssr runtimes
    // instead of checking if we use Yarn PnP (via `process.versions.pnp`),
    // we check if we can resolve the external deps from the cache-dir folder
    // to know if we need to enable this plugin so we also cover pnpm
    // It might be good idea to always enable it overall, but to limit potential
    // regressions we only enable it if we are sure we need it.
    const modulesToCheck = [
      `prop-types`,
      `lodash/isEqual`,
      `mitt`,
      `shallow-compare`,
      `@gatsbyjs/reach-router`,
      `gatsby-react-router-scroll`,
      `react-server-dom-webpack`,
      `gatsby-link`,
    ]
    for (const cacheDirDep of modulesToCheck) {
      try {
        cacheDirReq.resolve(cacheDirDep)
      } catch {
        // something is not resolable from the cache folder, so we should not enable this plugin
        isEverythingResolvableFromCacheDir = false
      }

      try {
        require.resolve(cacheDirDep)
      } catch {
        // something is not resolable from the gatsby package
        isEverythingResolvableFromGatsbyPackage = false
      }
    }

    // we only enable this plugin if we are unable to resolve cache-dir deps from .cache folder
    // and we can resolve them from gatsby package
    if (
      !isEverythingResolvableFromCacheDir &&
      isEverythingResolvableFromGatsbyPackage
    ) {
      this.isEnabled = true
    }
  }

  apply(resolver: Resolver): void {
    if (!this.isEnabled) {
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
            callback
          )
        }
      )
  }
}
