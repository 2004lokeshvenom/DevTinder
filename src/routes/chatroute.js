const express = require('express')
const { userAuth } = require('../middlewares/auth')
const chatRouter = express.Router()
const Chat = require('../Models/chat')

chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
  const { targetUserId } = req.params
  const userId = req.user._id
  try {
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
    }

    const messages = (chat.messages || []).map((m) => {
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
