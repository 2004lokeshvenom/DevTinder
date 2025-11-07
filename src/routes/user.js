const express = require('express')
const userRouter = express.Router()
const User = require('../Models/userdb')
const { userAuth } = require('../middlewares/auth')
const connectionrequestmodel = require('../Models/connectionreq')

userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const users = await connectionrequestmodel
      .find({
        $or: [
          { fromUserId: req.user._id, status: 'accepted' },
          { toUserId: req.user._id, status: 'accepted' },
        ],
      })
      .populate('fromUserId', 'firstName lastName age gender photoUrl about')
      .populate('toUserId', 'firstName lastName age gender photoUrl about')

    if (users.length === 0) {
      return res.status(404).json({ message: 'No connections found' })
    }
    const data = users.map((row) => {
      if (req.user._id.toString() == row.fromUserId._id.toString()) {
        return row.toUserId
      } else return row.fromUserId
    })

    res.status(200).json({
      message: 'Connections fetched successfully',
      data: data,
    })
  } catch (err) {
    res.status(500).json({ message: 'Error while loading connections', error: err.message })
  }
})

userRouter.get('/user/requests', userAuth, async (req, res) => {
  try {
    const users = await connectionrequestmodel
      .find({
        toUserId: req.user._id,
        status: 'interested',
      })
      .select('fromUserId')
      .populate('fromUserId', 'firstName lastName age gender photoUrl about')

    if (users.length == 0) throw new Error('requests not there')

    res.status(200).json({
      message: 'requests are there',
      data: users,
    })
  } catch (err) {
    res.status(404).json({ message: 'Error while loading requests', error: err.message })
  }
})

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10
    if (isNaN(limit) || limit < 1) limit = 10
    limit = limit > 50 ? 50 : limit
    const page = parseInt(req.query.page) || 1
    if (isNaN(page) || page < 1) {
      throw new Error('Page must be a positive number')
    }
    const skip = (page - 1) * limit

    const loggedInUser = req.user
    const notRequired = await connectionrequestmodel
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select('fromUserId toUserId')

    const idStrings = new Set()
    idStrings.add(loggedInUser._id.toString())
    notRequired.forEach((a) => {
      idStrings.add(a.fromUserId.toString())
      idStrings.add(a.toUserId.toString())
    })

    const data = await User.find({
      _id: { $nin: Array.from(idStrings) },
    })
      .select('firstName lastName age gender photoUrl about')
      .skip(skip)
      .limit(limit)

    if (!data || data.length === 0) {
      throw new Error('no feed found or use appropriate limit and page')
    }
    res.status(200).json({ message: 'data feed successfully', data: data })
  } catch (err) {
    res.status(404).json({ message: 'Something went wrong', error: err.message })
  }
})

module.exports = userRouter
