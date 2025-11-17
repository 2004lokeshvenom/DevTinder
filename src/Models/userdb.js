const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { membershipType } = require('../utils/constants')

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
  isPremium:{
    type: Boolean,
    default:false,
  },
  membershipType: {
    type: String,
    enum: ['silver', 'gold']
  },
})

NewSchema.methods.getJWT = function () {
  const user = this
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
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
