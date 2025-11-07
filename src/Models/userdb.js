const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const NewSchema = mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Male', 'male', 'Female', 'female'],
    required: true,
  },
  photoUrl: {
    type: String,
  },
  about: {
    type: String,
  },
})

NewSchema.methods.getJWT = function () {
  const user = this
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || '2004lokesh', {
    expiresIn: '7d',
  })
  return token
}

NewSchema.methods.validatePassword = async function (passwordGivenByUser) {
  const user = this
  const Password = user.password
  const passwordCheck = await bcrypt.compare(passwordGivenByUser, Password)
  return passwordCheck
}

module.exports = mongoose.model('User', NewSchema)
