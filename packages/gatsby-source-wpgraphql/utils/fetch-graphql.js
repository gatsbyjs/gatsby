"use strict";

const fetch = require(`isomorphic-fetch`);

const fetchGraphql = async ({
  url,
  query,
  variables = {}
}) => (await fetch(url, {
  method: `POST`,
  headers: {
    "Content-Type": `application/json`
  },
  body: JSON.stringify({
    query,
    variables
  })
})).json();

module.exports = fetchGraphql;