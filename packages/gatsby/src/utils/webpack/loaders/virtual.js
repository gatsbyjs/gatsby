module.exports = async function virtual(source, sourceMap): string {
  console.log({ options: this.getOptions() })
  const { modules } = this.getOptions()

  const requests = modules.split(`,`)

  const code = requests
    // Filter out css files on the server
    .map(
      request => `import(/* webpackMode: "eager" */ ${JSON.stringify(request)})`
    )
    .join(`;\n`)

  // const buildInfo = getModuleBuildInfo(this._module)
  // const resolve = this.getResolve()

  // // Resolve to absolute resource url for flight manifest to collect and use to determine client components
  // const resolvedRequests = await Promise.all(
  //   requests.map(async r => await resolve(this.rootContext, r))
  // )

  // buildInfo.rsc = {
  //   type: RSC_MODULE_TYPES.client,
  //   requests: resolvedRequests,
  // }

  return code
}
