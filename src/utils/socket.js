const socket = require('socket.io')
const crypto = require('crypto')
const Chat = require('../Models/chat')

const generateRoomId = (userId1, userId2) => {
  return crypto.createHash('sha256').update([userId1, userId2].sort().join('_')).digest('hex')
}

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on('joinRoom', ({ myName, userId, targetUserId }) => {
      const roomId = generateRoomId(userId, targetUserId)
      console.log(`${myName} joined room: ${roomId}`)
      socket.join(roomId)
    })

    socket.on('sendMessages', async ({ userId, myName, myPhoto, targetUserId, text }) => {
      try {
        const roomId = generateRoomId(userId, targetUserId)
        console.log(`${myName} sent message to room ${roomId}: ${text}`)

        let chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } })
        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          })
        }
        chat.messages.push({
          senderId: userId,
          text,
        })
        await chat.save()

        io.to(roomId).emit('receiveMessages', {
          senderId: userId,
          senderName: myName,
          senderPhoto: myPhoto,
          text,
        })
      } catch (err) {
        console.log(err)
      }
    })
    socket.on('disconnect', () => {})
  })
}

module.exports = initializeSocket
