const { gql } = require('apollo-server-express');

const { GraphQLDataSource } = require('apollo-datasource-graphql');

class GraphQLAPI extends GraphQLDataSource {
  baseURL = 'http://localhost:4005';

  async getUserByDatasource(args, context, info) {
    try {
      let queryString = info.fieldNodes[0].loc.source.body;
      queryString = queryString.replace('getUserByDatasource', 'user');
      const gqlQuery = gql`${queryString}`;
      const response = await this.query(gqlQuery);
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  async setUserByDatasource(args, context, info) {
    try {
      let queryString = info.fieldNodes[0].loc.source.body;
      queryString = queryString.replace('setUserByDatasource', 'test');
      const gqlQuery = gql`${queryString}`;
      const response = await this.mutation(gqlQuery);
      return response.data.test;
    } catch (error) {
      return null;
    }
  }
}

module.exports = () => ({ graphql: GraphQLAPI });
