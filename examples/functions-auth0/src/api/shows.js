const fetch = require("node-fetch").default
const {
  JwtVerifier,
  getTokenFromHeader,
} = require("@serverless-jwt/jwt-verifier")

const jwt = new JwtVerifier({
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
})

const shows = async (req, res) => {
  try {
    const scope = "read:shows"
    const token = getTokenFromHeader(req.get("authorization"))
    const claims = await jwt.verifyAccessToken(token)

    if (!claims || !claims.scope || claims.scope.indexOf(scope) === -1) {
      return res.status(403).json({
        error: "access_denied",
        error_description: `Token does not contain the required '${scope}' scope`,
      })
    }

    const result = await fetch("https://api.tvmaze.com/shows")
    const shows = await result.json()

    res.status(200).json(
      shows.map(s => ({
        id: s.id,
        url: s.url,
        name: s.name,
      }))
    )
  } catch (err) {
    res.status(500).json({ error_description: err.message })
  }
}

export default shows
