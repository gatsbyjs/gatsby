export async function setSiteMetadata(
  root: string,
  name: string,
  value: string
): Promise<void> {
  try {
    const recipesPath = require.resolve(`gatsby-recipes`, {
      paths: [root],
    })
    const { GatsbySiteMetadata } = require(recipesPath)
    await GatsbySiteMetadata?.create({ root }, { name, value })
  } catch (e) {
    // Silently fail, as it's fine if we don't add it to the config
  }
}
