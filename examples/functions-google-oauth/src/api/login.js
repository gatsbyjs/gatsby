const { google } = require("googleapis");

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Initialize the Google OAuth client.
const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  // Redirect URL:
  // http://localhost:8000/api/googleAccessToken
  process.env.GOOGLE_REDIRECT_URI
);

google.options({ auth: oauth2Client });

const scopes = ["profile"];

export default async (req, res) => {
  // Generate the callback URL with options.
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" "),
  });

  // Appends the ?code query param to the return URL from above.
  // Redirects to next Gatsby Function.
  return res.redirect(authorizeUrl);
};
