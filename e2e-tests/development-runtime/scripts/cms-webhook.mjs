import fetch from "node-fetch"

fetch(`http://localhost:8000/__refresh/${process.argv[2]}`, {
  method: `POST`,
  headers: {
    "Content-Type": `application/json`,
  },
  body: JSON.stringify({
    "fake-data-update": true,
  }),
})
