import { ProgressPlugin } from "webpack"
import resolveFrom from "resolve-from"
import type reporter from "gatsby-cli/lib/reporter"
import type { Compiler } from "webpack"

type Reporter = typeof reporter

export class WebpackLoggingPlugin {
  private PLUGIN_NAME = `WebpackLogging`
  private rootDir: string
  private reporter: Reporter
  private isVerbose = false

  constructor(rootDir: string, reporter: Reporter, isVerbose = false) {
    this.rootDir = rootDir
    this.reporter = reporter
    this.isVerbose = isVerbose
  }

  apply(compiler: Compiler): void {
    compiler.options.infrastructureLogging = {
      level: `verbose`,
      debug: /FileSystemInfo/,
    }
    compiler.options.profile = true

    new ProgressPlugin({
      profile: true,
    }).apply(compiler)

    // if webpack bundle analyzer is installed lets use it
    const webpackBundleAnalyzerPath = resolveFrom.silent(
      this.rootDir,
      `webpack-bundle-analyzer`
    )
    if (webpackBundleAnalyzerPath) {
      compiler.hooks.beforeRun.tapPromise(this.PLUGIN_NAME, () =>
        import(webpackBundleAnalyzerPath).then(({ BundleAnalyzerPlugin }) => {
          new BundleAnalyzerPlugin({
            analyzerMode: `static`,
            openAnalyzer: false,
            title: compiler.name,
            reportFilename: `report.html`,
          }).apply(compiler)
        })
      )
    }

    compiler.hooks.done.tap(this.PLUGIN_NAME, stats => {
      this.reporter.log(
        stats.toString({
          colors: true,
          logging: this.isVerbose ? `verbose` : `log`,
        })
      )
    })
  }
}
