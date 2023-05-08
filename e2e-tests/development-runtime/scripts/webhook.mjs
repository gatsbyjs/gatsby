import fetch from "node-fetch"

fetch(`http://localhost:8000/__refresh`, {
  method: `POST`,
  headers: {
    "Content-Type": `application/json`,
  },
  body: JSON.stringify({
    items: [
      {
        updates: 0,
        uuid: 999,
        title: `Hello World from a Webhook (999)`,
        message: `testing`,
      },
    ],
  }),
})
