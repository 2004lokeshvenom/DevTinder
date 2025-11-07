// middlewares/auth.js
const jwt = require('jsonwebtoken')
const User = require('../Models/userdb')

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies
    if (!token) {
      return res.status(401).json({ message: 'Token is not valid' })
    }
    const decodedMessage = jwt.verify(token, process.env.JWT_SECRET || '2004lokesh')
    const user = await User.findById(decodedMessage._id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Authentication error', error: err.message })
  }
}

module.exports = { userAuth }
