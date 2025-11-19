require('dotenv').config()
const express = require('express')
const app = express()
const connectDB = require('./config/database')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authroute')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')
const chatRouter = require('./routes/chatroute')
const cors = require('cors')
const http = require('http')
const { PaymentsRouter } = require('./routes/Payments')
const initializeSocket = require('./utils/socket')
require('./utils/shedule')

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

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
app.use('/', chatRouter)

const server = http.createServer(app)

initializeSocket(server)

connectDB()
  .then(() => {
    console.log('Database connected successfully')
    server.listen(process.env.PORT, () => {
      console.log('Server is listening on port ' + process.env.PORT)
    })
  })
  .catch((err) => {
    console.log('Database connection failed:', err.message)
  })
