const RazorPay = require('razorpay')

const instance = new RazorPay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

console.log('Razorpay Loaded → ', process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET ? 'OK' : 'Missing')

module.exports = instance
