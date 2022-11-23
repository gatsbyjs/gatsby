const {
  JwtVerifier,
  JwtVerifierError,
  getTokenFromHeader,
} = require("@serverless-jwt/jwt-verifier")

const jwt = new JwtVerifier({
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
})

const me = async (req, res) => {
  if (req.method !== "GET") {
    return res.json({ message: "Try a GET!" })
  }

  try {
    const token = getTokenFromHeader(req.get("authorization"))
    const claims = await jwt.verifyAccessToken(token)

    res.status(200).json({ claims })
  } catch (err) {
    if (err instanceof JwtVerifierError) {
      console.error(err.code, err.message)
      res.status(401).json({ error_description: err.message })
    } else {
      console.error(err)
      res.status(500).json({ error_description: err.message })
    }
  }
}

export default me
