import * as express from "express"

export default function topLevel(req: express.Request, res: express.Response) {
  if (req.method === `GET`) {
    res.send(`I am typescript`)
  }
}
