const handler = require(`serve-handler`)
const http = require(`http`)
const path = require(`path`)

const server = http.createServer((request, response) =>
  handler(request, response, {
    public: path.resolve(`assets`),
    headers: [
      {
        source: `**/*`,
        headers: [
          {
            key: `Access-Control-Allow-Origin`,
            value: `http://localhost:9000`,
          },
          {
            key: `Access-Control-Allow-Credentials`,
            value: true,
          },
        ],
      },
    ],
  })
)

server.listen(9001, () => {
  console.log(`Running at http://localhost:9001`)
})
