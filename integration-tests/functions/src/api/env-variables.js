export default function topLevel(req, res) {
  res.send(process.env.pickle)
}
