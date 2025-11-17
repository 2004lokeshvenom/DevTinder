require('dotenv').config()
const express = require('express')
const app = express()
const connectDB = require('./config/database')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authroute')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')
const cors = require('cors')
const { PaymentsRouter } = require('./routes/Payments')
require('./utils/shedule')

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

// Use raw body ONLY for Razorpay webhook, JSON for everything else
app.use((req, res, next) => {
  if (req.originalUrl === '/payments/webhook') {
    return express.raw({ type: 'application/json' })(req, res, next)
  }
  return express.json()(req, res, next)
})

app.use(cookieParser())

app.use('/', authRouter)
app.use('/', profileRouter)
app.use('/', requestRouter)
app.use('/', userRouter)
app.use('/', PaymentsRouter)

connectDB()
  .then(() => {
    console.log('Database connected successfully')
    app.listen(process.env.PORT, () => {
      console.log('Server is listening on port ' + process.env.PORT)
    })
  })
  .catch((err) => {
    console.log('Database connection failed:', err.message)
  })
