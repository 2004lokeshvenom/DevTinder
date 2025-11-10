const express = require('express')
const requestRouter = express.Router()
const { userAuth } = require('../middlewares/auth')
const User = require('../Models/userdb')
const connectionrequestmodel = require('../Models/connectionreq')
const sendEmail = require('../utils/sendEmail')

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id
    const toUserId = req.params.toUserId
    const status = req.params.status

    if (!toUserId || !/^[0-9a-fA-F]{24}$/.test(toUserId)) {
      throw new Error('Invalid user ID format')
    }

    if (fromUserId.toString() === toUserId) {
      throw new Error('you cant send request to your own id')
    }
    const isToUserIdValid = await User.findById(toUserId)
    if (!isToUserIdValid) {
      throw new Error('to user id is not valid')
    }
    const oppositePerson = isToUserIdValid.lastName
    const sameSidePerson = req.user.lastName
    const allowedStatus = ['interested', 'ignored']
    if (!allowedStatus.includes(status)) {
      throw new Error('given status is not allowed')
    }

    const isConnectionExists = await connectionrequestmodel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    })
    if (isConnectionExists) {
      throw new Error('request already exists')
    }

    const request = new connectionrequestmodel({
      fromUserId,
      toUserId,
      status,
    })

    const data = await request.save()

    if (status === 'interested' && isToUserIdValid.email) {
      try {
        const fromEmail = process.env.FROM_EMAIL
        const subject = `New Interest Request from ${req.user.firstName} ${sameSidePerson} to ${isToUserIdValid.firstName} ${oppositePerson}`
        const loginUrl = process.env.APP_URL
        const htmlBody = `
          <div style="font-family: Arial, sans-serif; background:#f6f8fb; padding:24px;">
            <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
              <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:24px;">
                <h1 style="margin:0; color:#ffffff; font-size:22px;">DevTinder</h1>
              </div>
              <div style="padding:24px;">
                <h2 style="color:#111827; font-size:20px; margin:0 0 12px;">You have a new interest request</h2>
                <p style="color:#374151; font-size:14px; line-height:1.6; margin:0 0 16px;">
                  <strong>${req.user.firstName} ${sameSidePerson}</strong> has shown interest in connecting with you on DevTinder.
                </p>
                <a href="${loginUrl}" style="display:inline-block; background:#4f46e5; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:8px; font-weight:600; font-size:14px;">
                  Review request
                </a>
                <p style="color:#6b7280; font-size:12px; margin:16px 0 0;">
                  If the button doesn’t work, copy and paste this link into your browser:<br/>
                  <span style="color:#4f46e5; word-break:break-all;">${loginUrl}</span>
                </p>
              </div>
              <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px;">
                © ${new Date().getFullYear()} DevTinder. All rights reserved.
              </div>
            </div>
          </div>
        `
        const textBody = `You have a new interest request from ${req.user.firstName} ${sameSidePerson}. Review it at: ${loginUrl}`
        sendEmail
          .run('lokeshvanamayya02@gmail.com', fromEmail, subject, htmlBody, textBody) //here change lokeshvanamayya@gmail.com to isToUserIdValid.email lateron
          .then(() => {
            console.log('Email sent successfully to', isToUserIdValid.email)
          })
          .catch((emailErr) => {
            console.log('Email sending failed (non-critical):', emailErr.message)
          })
      } catch (emailErr) {
        console.log('Email sending error (non-critical):', emailErr.message)
      }
    }
    res.status(201).json({ message: `connection request send succcessfully ${sameSidePerson} send request to ${oppositePerson}`, data })
  } catch (err) {
    res.status(400).json({ message: 'ERROR while sending interest', error: err.message })
  }
})

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
  try {
    const { status, requestId } = req.params
    const allowedStatuses = ['accepted', 'rejected']

    if (!allowedStatuses.includes(status)) {
      throw new Error('Status is not allowed')
    }

    if (!requestId) {
      throw new Error('Invalid request ID format')
    }

    const request = await connectionrequestmodel.findById(requestId)
    if (!request) throw new Error('Request ID not found')

    if (request.status !== 'interested') throw new Error('requested id has not interested button')

    if (request.toUserId.toString() !== req.user._id.toString()) {
      throw new Error('Log in with appropriate user ID to review this request')
    }
    const oppositeGuy = await User.findById(request.fromUserId)
    if (!oppositeGuy) {
      throw new Error('User not found')
    }
    const oppositeGuyName = oppositeGuy.lastName || 'User'
    const sameSidePersonName = req.user.lastName || 'User'

    request.status = status
    const savedRequest = await request.save()
    if (oppositeGuy.email) {
      try {
        const fromEmail = process.env.FROM_EMAIL
        const subject = `${oppositeGuy.firstName} ${oppositeGuy.lastName} request has been reviwed by ${req.user.firstName} ${req.user.lastName}`
        const loginUrl = process.env.APP_URL
        const htmlBody = `
          <div style="font-family: Arial, sans-serif; background:#f6f8fb; padding:24px;">
            <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
              <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:24px;">
                <h1 style="margin:0; color:#ffffff; font-size:22px;">DevTinder</h1>
              </div>
              <div style="padding:24px;">
                <h2 style="color:#111827; font-size:20px; margin:0 0 12px;">You have a new notification</h2>
                <p style="color:#374151; font-size:14px; line-height:1.6; margin:0 0 16px;">
                  <strong>${req.user.firstName} ${sameSidePersonName}</strong> has ${status} your request in connecting with you on DevTinder.
                </p>
                <a href="${loginUrl}" style="display:inline-block; background:#4f46e5; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:8px; font-weight:600; font-size:14px;">
                  Check Connections
                </a>
                <p style="color:#6b7280; font-size:12px; margin:16px 0 0;">
                  If the button doesn’t work, copy and paste this link into your browser:<br/>
                  <span style="color:#4f46e5; word-break:break-all;">${loginUrl}</span>
                </p>
              </div>
              <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px;">
                © ${new Date().getFullYear()} DevTinder. All rights reserved.
              </div>
            </div>
          </div>
        `
        const textBody = `you have a new notification ${sameSidePersonName} has ${status} your request in connecting with on DevTinder`
        sendEmail
          .run('lokeshvanamayya02@gmail.com', fromEmail, subject, htmlBody, textBody)//here change lokeshvanamayya@gmail.com to oppositeGuy.email lateron
          .then(() => {
            console.log('Email sent successfully to', oppositeGuy.email)
          })
          .catch((emailErr) => {
            console.log('Email sending failed (non-critical):', emailErr.message)
          })
      } catch (emailErr) {
        console.log('Email sending error (non-critical):', emailErr.message)
      }
    }
    res.status(200).json({
      message: `${oppositeGuyName} request has reviewed by ${sameSidePersonName} that is ${status}`,
      data: savedRequest,
    })
  } catch (err) {
    res.status(400).json({ message: 'ERROR while reviewing request', error: err.message })
  }
})

module.exports = requestRouter
