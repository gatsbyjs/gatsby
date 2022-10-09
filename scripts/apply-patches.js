let _CFLAGS_ = {
  GATSBY_MAJOR: `4`,
}
if (process.env.COMPILER_OPTIONS) {
  // COMPILER_OPTIONS syntax is key=value,key2=value2
  _CFLAGS_ = process.env.COMPILER_OPTIONS.split(`,`).reduce((acc, curr) => {
    const [key, value] = curr.split(`=`)

    if (key) {
      acc[key] = value
    }

    return acc
  }, _CFLAGS_)
}

if (_CFLAGS_.GATSBY_MAJOR === `5`) {
  const { applyPatches } = require(`./apply-patches-utils`)

  applyPatches(_CFLAGS_.GATSBY_MAJOR)
}
