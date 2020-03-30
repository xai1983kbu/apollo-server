import 'dotenv/config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'

import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'
import message from './models/message'

const app = express()

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  // The function is invoked every time a request hits your GraphQL API, so the me user is retrieved from the database with every request.
  context: async () => ({
    models,
    me: models.Users.findByLogin('SAndriy')
  })
})

server.applyMiddleware({ app, path: '/graphql' })

const eraseDatabaseonSync = true

sequelize.sync({ force: eraseDatabaseonSync }).then(async () => {
  if (eraseDatabaseonSync) {
    createUsersWithMessages()
  }

  app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql')
  })
})

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: 'SAndriy',
      messages: [
        {
          text: 'First Message from SAndriy'
        },
        {
          text: 'Second Message from SAndriy'
        }
      ]
    },
    {
      include: [models.Message]
    }
  )

  await models.User.create(
    {
      username: 'Mario',
      messages: [
        {
          text: 'First message from Mario'
        },
        {
          text: 'Second message from Mario'
        }
      ]
    },
    {
      include: [models.Message]
    }
  )
}
