const express = require('express')
const { userAuth } = require('../middlewares/auth')
const PaymentsRouter = express.Router()
const RazorpayInstance = require('../utils/paymentsutil')
const payments = require('../Models/payments')
const { membershipType } = require('../utils/constants')
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')
const User = require('../Models/userdb')

PaymentsRouter.post('/payments/create', userAuth, async (req, res) => {
  try {
    if (!req.body.plan || !membershipType[req.body.plan]) {
      return res.status(400).json({ msg: 'Invalid plan. Choose silver or gold' })
    }

    const { firstName, lastName, email } = req.user
    const amount = membershipType[req.body.plan] * 100

    const order = await RazorpayInstance.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: 'receipt1',
      notes: {
        firstName,
        lastName,
        email,
        membershipType: req.body.plan,
      },
    })
    const payment = new payments({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      receipt: order.receipt,
      notes: order.notes,
    })
    const paymentSave = await payment.save()
    console.log(paymentSave)
    res.json({
      ...paymentSave.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ msg: err.message })
  }
})

PaymentsRouter.post('/payments/webhook', async (req, res) => {
  try {
    console.log('🔥 WEBHOOK RECEIVED')

    const webhookSignature = req.headers['x-razorpay-signature']

    // For /payments/webhook, body is a Buffer (from express.raw); fall back to JSON string if not
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body)
    console.log('Raw body:', rawBody)

    const isValid = validateWebhookSignature(rawBody, webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET)

    if (!isValid) {
      console.log('❌ Invalid signature')
      return res.status(400).json({ msg: 'Invalid signature' })
    }

    const data = Buffer.isBuffer(req.body) ? JSON.parse(rawBody) : req.body
    const payment = data.payload.payment.entity
    const orderId = payment.order_id

    console.log('OrderId from webhook:', orderId)

    const paymentRecord = await payments.findOne({ orderId })
    if (!paymentRecord) {
      console.log('❌ Payment record not found')
      return res.status(404).json({ msg: 'Payment record not found' })
    }

    paymentRecord.status = payment.status
    paymentRecord.paymentId = payment.id
    await paymentRecord.save()

    const user = await User.findById(paymentRecord.userId)
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    user.isPremium = true
    user.membershipType = paymentRecord.notes.membershipType
    await user.save()

    console.log('✅ Webhook processed, user updated')

    res.status(200).json({ msg: 'OK' })
  } catch (err) {
    console.log('❌ Error:', err)
    res.status(500).json({ msg: err.message })
  }
})

module.exports = { PaymentsRouter }
