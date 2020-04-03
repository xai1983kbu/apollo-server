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
    // me: models.User.findByLogin('SAndriy')
    me: { username: 'SAndriy', id: 1 }
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
      pool_username: 'a78ae572-abe7-42b2-9f9d-eb5f3b9a3619',
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
      pool_username: 'c788df2f-9ec0-4210-af02-34ed1c207e50',
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
