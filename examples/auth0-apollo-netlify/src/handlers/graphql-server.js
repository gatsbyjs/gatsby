const { ApolloServer, gql, AuthenticationError } = require('apollo-server-lambda');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const { AUTH0_DOMAIN, AUTH0_CLIENT_ID } = process.env;

const typeDefs = gql`
  type Query {
    hello: String
  }

  type Mutation {
    update(title: String): String
  }
`;

const resolvers = {
  Query: {
    hello: async (_, agrs, { user }, info) => {
      return user;
    },
  },
  Mutation: {
    update: async (_, { title }, { user }) => {
      try {
        // eslint-disable-next-line no-unused-vars
        const email = await user;
        return title;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
  },
};

const client = jwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getKey(header, cb) {
  client.getSigningKey(header.kid, function(_, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    cb(null, signingKey);
  });
}

const options = {
  audience: AUTH0_CLIENT_ID,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ event }) => {
    let user;

    try {
      const token = event.headers.authorization;
      if (!token) {
        throw new Error('Missing authentication header');
      }

      user = new Promise((resolve, reject) => {
        jwt.verify(token, getKey, options, (err, decoded) => {
          if (err) {
            return reject(err);
          }

          resolve(decoded.email);
        });
      });
    } catch (error) {
      throw new AuthenticationError(error);
    }

    return {
      user,
    };
  },
});

exports.handler = server.createHandler();
