// middlewares/auth.js
const jwt = require('jsonwebtoken')
const User = require('../Models/userdb')

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies
    if (!token) {
      return res.status(401).send('Token is not valid')
    }
    const decodedMessage = jwt.verify(token, process.env.JWT_SECRET || '2004lokesh')
    const user = await User.findById(decodedMessage._id)
    if (!user) {
      return res.status(404).send('User not found')
    }
    req.user = user
    next()
  } catch (err) {
    console.error('Auth error:', err.message)
    return res.status(400).send('ERROR: ' + err.message)
  }
}

module.exports = { userAuth }
