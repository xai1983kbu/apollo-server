import uuidv4 from 'uuid/v4'
import user from './../models/user'

export default {
  Query: {
    messages: async (parent, args, { models }) => {
      return await models.Message.findAll()
    },
    message: async (parent, { id }, { models }) => {
      return await models.Message.findByPk(id)
    }
  },

  Mutation: {
    createMessage: async (parent, { text }, { me, models }) => {
      return await models.Message.create({
        text,
        userId: me.id
      })
    },

    deleteMessage: async (parent, { id }, { models }) => {
      return await models.Message.destroy({
        where: { id }
      })
    },

    updateMessage: async (parent, { id, newText }, { models }) => {
      try {
        const result = await models.Message.update(
          { text: newText },
          { where: { id } }
        )
        return result
      } catch (err) {
        return null
      }
    }
  },

  Message: {
    user: async (message, args, { models }) => {
      return await models.User.findByPk(message.userId)
    }
  }
}
