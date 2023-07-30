export default function (req, res) {
  res.send(`Hello World from ${req.params['*']}`)
}
