// TODO remove in gatsby v3
// keeps old behaviour in tact when createDigestContent is not available
const crypto = require(`crypto`)

module.exports = content =>
  crypto
    .createHash(`md5`)
    .update(content)
    .digest(`hex`)
