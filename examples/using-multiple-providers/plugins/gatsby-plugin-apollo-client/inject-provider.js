import React from "react"
import ApolloClient from "apollo-boost"
import { ApolloProvider } from "react-apollo"

const client = new ApolloClient({
  uri: `https://api-euwest.graphcms.com/v1/cjjr1at6d0xb801c3scjrm0l0/master`,
})

// eslint-disable-next-line react/prop-types,react/display-name
export default ({ element }) => (
  <ApolloProvider client={client}>{element}</ApolloProvider>
)
