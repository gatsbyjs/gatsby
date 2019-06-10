// TODO: remove in gatsby v3
exports.createContentDigest = input => {
  try {
    const { createContentDigest } = require(`gatsby/utils`)

    return createContentDigest(input)
  } catch (e) {
    const content = typeof input !== `string` ? JSON.stringify(input) : input

    return require(`crypto`)
      .createHash(`md5`)
      .update(content)
      .digest(`hex`)
  }
}
