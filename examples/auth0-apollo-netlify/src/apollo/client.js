import ApolloClient from 'apollo-boost';
import fetch from 'isomorphic-fetch';

export const client = ({ idToken }) => {
  return new ApolloClient({
    uri: '/.netlify/functions/graphql-server',
    fetch,
    request: operation => {
      operation.setContext(context => ({
        headers: {
          ...context.headers,
          ...(idToken && { authorization: idToken }),
        },
      }));
    },
  });
};
