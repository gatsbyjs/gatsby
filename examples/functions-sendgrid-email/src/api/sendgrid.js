const sendgrid = require("@sendgrid/mail")
//Your API Key from Sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
const message = {
  //Your authorized email from SendGrid
  from: process.env.SENDGRID_AUTHORIZED_EMAIL,
}

const handler = (req, res) => {
  try {
    if (req.method !== "POST") {
      res.json({ message: "Try a POST!" })
    }

    if (req.body) {
      message.to = req.body.email
      message.subject = req.body.subject
      message.text = req.body.text
      message.html = req.body.text
    }

    return sendgrid.send(message).then(
      () => {
        res.status(200).json({
          message: "I will send email",
        })
      },
      error => {
        console.error(error)
        if (error.response) {
          return res.status(500).json({
            error: error.response,
          })
        }
      }
    )
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "There was an error", error: err })
  }
}

module.exports = handler
