const express = require('express')
const authRouter = express.Router()
const User = require('../Models/userdb')
const bcrypt = require('bcrypt')
const { validateuser } = require('../utils/validate')

authRouter.post('/signup', async (req, res) => {
  try {
    validateuser(req)

    const { firstName, lastName, email, password, age, gender, photoUrl, about } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      gender,
      photoUrl,
      about,
    })

    await user.save()
    res.status(201).json({ message: 'User saved successfully' })
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong while saving data', error: err.message })
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      throw new Error('Enter credentials')
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const passwordCheck = await user.validatePassword(password)
    if (!passwordCheck) {
      return res.status(401).json({ message: 'Wrong password credentials' })
    }

    const token = user.getJWT()
    res.cookie('token', token, { httpOnly: true })
    res.status(200).json({ message: 'Login successful', data: user })
  } catch (err) {
    const statusCode = err.message === 'Enter credentials' ? 400 : 401
    res.status(statusCode).json({ message: 'Something went wrong while logging in', error: err.message })
  }
})

authRouter.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ message: 'Logout successful' })
})

module.exports = authRouter
