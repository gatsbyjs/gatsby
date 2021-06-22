const { google } = require("googleapis")

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET

// Intialize our Google OAuth client, same as in login function.
const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  process.env.GOOGLE_REDIRECT_URI
)

google.options({ auth: oauth2Client })

const googleAccessToken = async (req, res) => {
  // Get the code appended from Google generateAuthUrl.
  const code = req.query.code

  // Get the auth token.
  const token = await oauth2Client.getToken(code)

  // http://localhost:8000/auth-redirect
  // Redirect to auth page and set the token in the URL.
  return res.redirect(
    `${process.env.APP_REDIRECT_URI}?token=${JSON.stringify(token?.tokens)}`
  )
}

export default googleAccessToken
