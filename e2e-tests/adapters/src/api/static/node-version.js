export default function (req, res) {
  res.json({ nodeVersion: process.version })
}
