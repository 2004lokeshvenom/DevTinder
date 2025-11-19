const express = require('express')
const { userAuth } = require('../middlewares/auth')
const chatRouter = express.Router()
const Chat = require('../Models/chat')

// GET chat between logged-in user and targetUserId
chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
  const { targetUserId } = req.params
  const userId = req.user._id // mongoose ObjectId
  try {
    // Find existing chat (participants contains both)
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: 'messages.senderId',
      select: 'firstName lastName photoUrl',
    })

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      })
      await chat.save()
      // Re-populate not necessary since messages is empty
    }

    // Map messages into a simple shape the frontend expects.
    // Ensure senderId is a string and include senderPhoto (photoUrl).
    const messages = (chat.messages || []).map((m) => {
      // If populated, m.senderId will be an object with _id, firstName, lastName, photoUrl.
      // If not populated, m.senderId will be an ObjectId.
      const senderObj = m.senderId || null
      const senderIdStr =
        (senderObj && senderObj._id && senderObj._id.toString()) || (senderObj && senderObj.toString && senderObj.toString()) || null

      const senderName = senderObj && senderObj.firstName ? `${senderObj.firstName} ${senderObj.lastName || ''}`.trim() : undefined

      const senderPhoto = senderObj && senderObj.photoUrl ? senderObj.photoUrl : null

      return {
        _id: m._id,
        text: m.text,
        senderId: senderIdStr,
        senderName,
        senderPhoto,
        createdAt: m.createdAt,
      }
    })

    return res.status(200).json({ messages, participants: chat.participants })
  } catch (err) {
    console.error('[GET /chat/:targetUserId] error:', err)
    return res.status(500).json({ msg: err.message || 'Server error' })
  }
})

module.exports = chatRouter
