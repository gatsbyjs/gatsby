const Airtable = require("airtable")

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  //Your API Key from Airtable
  apiKey: process.env.AIRTABLE_KEY,
})

// Your Table ID from Airtable
const db = Airtable.base(process.env.AIRTABLE_DB)

const handler = (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(404).json({ message: "This endpoint requires a POST" })
    }

    const data = req.body

    if (!data) {
      return res.status(500).json({ error: "There isn't any data." })
    }

    db("Submissions").create(
      [
        {
          fields: {
            Name: data.name,
            Email: data.email,
            Message: data.message,
          },
        },
      ],
      (err, records) => {
        if (err) {
          res.json({
            message: "Error adding record to Airtable.",
            error: err.message,
          })
        } else {
          res.json({ message: `Successfully submitted message` })
        }
      }
    )
  } catch (err) {
    console.log(err)
    res.json({ message: "There has been a big error.", error: err })
  }
}

module.exports = handler
