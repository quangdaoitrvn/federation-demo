const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const dataSources = require('./datasources');

const typeDefs = gql`
  extend type Query {
    topReviews(first: Int = 5): [Review]
    getUserByDatasource(id: Int): UserTest
    
  }
  extend type Mutation {
    setUserByDatasource(name: String, birthDate: String, username: String): UserTest
  }
  type Review @key(fields: "id") {
    id: ID!
    body: String
    author: User @provides(fields: "username")
    product: Product
  }

  type UserTest @key(fields: "id") {
    id: ID!
    name: String
    username: String
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    username: String @external
  }

  extend type Product @key(fields: "upc") {
    upc: String! @external
    reviews: [Review]
  }
`;

const resolvers = {
  Review: {
    author(review) {
      return { __typename: 'User', id: review.authorID };
    },
  },
  User: {
    reviews(user) {
      console.log('view 0');
      return reviews.filter(review => review.authorID === user.id);
    },
    numberOfReviews(user) {
      console.log('view 1');
      return reviews.filter(review => review.authorID === user.id).length;
    },
    username(user) {
      const found = usernames.find(username => username.id === user.id);
      return found ? found.username : null;
    },
  },
  Product: {
    reviews(product) {
      return reviews.filter(review => review.product.upc === product.upc);
    },
  },
  Query: {
    topReviews(_, args) {
      return reviews.slice(0, args.first);
    },
    async getUserByDatasource(_, args, context, info) {
      const { dataSources } = context;
      const graphql = new dataSources.graphql();
      const result = await graphql.getUserByDatasource(args, context, info);
      return result;
    },
  },
  Mutation: {
    async setUserByDatasource(_, args, context, info) {
      const { dataSources } = context;
      const graphql = new dataSources.graphql();
      const result = await graphql.setUserByDatasource(args, context, info);
      return result;
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
  dataSources,
});

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const usernames = [
  { id: '1', username: '@ada' },
  { id: '2', username: '@complete' },
];
const reviews = [
  {
    id: '1',
    authorID: '1',
    product: { upc: '1' },
    body: 'Love it!',
  },
  {
    id: '2',
    authorID: '1',
    product: { upc: '2' },
    body: 'Too expensive.',
  },
  {
    id: '3',
    authorID: '2',
    product: { upc: '3' },
    body: 'Could be better.',
  },
  {
    id: '4',
    authorID: '2',
    product: { upc: '1' },
    body: 'Prefer something else.',
  },
];
