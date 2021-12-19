export async function setSiteMetadata(
  root: string,
  name: string,
  value: string
): Promise<void> {
  try {
    const coreUtilsPath = require.resolve(`gatsby-core-utils`, {
      paths: [root],
    })
    const { addFieldToMinimalSiteMetadata } = require(coreUtilsPath)
    await addFieldToMinimalSiteMetadata({ root }, { name, value })
  } catch (e) {
    // Silently fail, as it's fine if we don't add it to the config
  }
}
