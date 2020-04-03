import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    users: [User!]
    me: User
    user(id: ID!): User
  }

  type User {
    id: ID!
    username: String!
    pool_username: String
    messages: [Message!]
  }
`
