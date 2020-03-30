import uuidv4 from 'uuid/v4'

export default {
  Query: {
    messages: (parent, args, { models }) => {
      return Object.values(models.messages)
    },
    message: (parent, { id }, { models }) => {
      return models.messages[id]
    }
  },

  Mutation: {
    createMessage: (parent, { text }, { me, models }) => {
      const id = uuidv4()
      const message = {
        id,
        text,
        userId: me.id
      }

      models.messages[id] = message
      models.users[me.id].messageId.push(id)

      return message
    },

    deleteMessage: (parent, { id }, { models }) => {
      // The resolver finds the message by id from the messages object using destructuring.
      const { [id]: message, ...otherMessages } = models.messages

      if (!message) {
        return false
      }

      models.messages = otherMessages

      return true
    },

    updateMessage: (parent, { id, newText }, { models }) => {
      const { [id]: oldMessage, ...otherMessages } = models.messages

      if (oldMessage) {
        const newMessage = {
          id,
          text: newText
        }
        models.messages = otherMessages
        models.messages[id] = newMessage
        return newMessage
      }
      return
    }
  },

  Message: {
    user: (message, args, { models }) => {
      return models.users[message.userId]
    }
  }
}
