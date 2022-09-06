import { createGraphiQLFetcher } from "@graphiql/toolkit"

export const fetchFragments = async () =>
  fetch(`/___graphql/fragments`)
    .catch(err => console.error(`Error fetching external fragments: \n${err}`))
    .then(response => response.json())

export const fetcher = createGraphiQLFetcher({ url: `/___graphql` })

// Produce a Location query string from a parameter object.
export const locationQuery = params =>
  `?` +
  Object.keys(params)
    .filter(function (key) {
      return Boolean(params[key])
    })
    .map(function (key) {
      return encodeURIComponent(key) + `=` + encodeURIComponent(params[key])
    })
    .join(`&`)
