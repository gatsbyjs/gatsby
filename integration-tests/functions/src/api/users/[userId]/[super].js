export default function userIdHandler(req, res) {
  console.log(req.params)
  res.json(req.params)
}
