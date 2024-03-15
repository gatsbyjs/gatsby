if (
  process.env.GATSBY_FUNCTIONS_PLATFORM !== process.platform ||
  process.env.GATSBY_FUNCTIONS_ARCH !== process.arch
) {
  throw new Error(
    `Incompatible function executing environment. Function was built for "${process.env.GATSBY_FUNCTIONS_PLATFORM}/${process.env.GATSBY_FUNCTIONS_ARCH}" but is executing on "${process.platform}/${process.arch}".`
  )
}
