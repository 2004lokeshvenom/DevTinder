const express = require('express')
const { userAuth } = require('../middlewares/auth')
const PaymentsRouter = express.Router()
const RazorpayInstance = require('../utils/paymentsutil')
const payments = require('../Models/payments')
const {membershipType}=require("../utils/constants");
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
      receipt: "receipt1",
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

PaymentsRouter.post('/payments/webhook', async (req, res) =>{
  try {
    const webhookSignature = req.headers('x-razorpay-signature')
    const isWebHookValid=validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET)
    
    if(!isWebHookValid){
      return res.status(400).json({ msg: "Invalid webhook signature" })
    }
    const paymentId=req.body.payload.payment.entity.id;
    const paymentRecord=await payments.findOne({orderId: paymentId.order_id});
    if(!paymentRecord){
      return res.status(404).json({ msg: "Payment record not found while webhook" })
    }
    paymentRecord.status=paymentId.status;
    await paymentRecord.save();

    const user=await User.findById(paymentRecord.userId);
    if(!user){
      return res.status(404).json({ msg: "User not found while webhook" })
    }
    user.ispremium=true;
    user.membershipType=paymentRecord.notes.membershipType;
    await user.save();
    res.status(200).json({ msg: "Webhook processed successfully" })
  }catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "webhook issue is there"+ err.message })
  }
}) 
module.exports = { PaymentsRouter }
