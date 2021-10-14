export default function handler(req, res) {
  res.send(`hi`)
  res.json({ willCauseError: true })
}
